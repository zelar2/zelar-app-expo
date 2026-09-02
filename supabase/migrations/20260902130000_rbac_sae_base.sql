-- ============================================================================
-- ZELAR+ — BASE RBAC + SAE
--
-- Reconstruída a partir dos tipos Supabase recuperados do projeto e do código
-- real da aplicação.
--
-- IMPORTANTE:
-- - Não inclui o papel "suporte", pois o enum recuperado do schema contém
--   somente: paciente, familiar, profissional, admin, cliente, executivo.
-- - Não altera pg_net.
-- - Não cria tabelas que não foram confirmadas como necessárias nesta etapa.
-- ============================================================================

-- ============================================================================
-- EXTENSÕES
-- ============================================================================

create extension if not exists pgcrypto;

-- ============================================================================
-- ENUMS RECUPERADOS
-- ============================================================================

do $$
begin
  if not exists (
    select 1
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where n.nspname = 'public'
      and t.typname = 'app_role'
  ) then
    create type public.app_role as enum (
      'paciente',
      'familiar',
      'profissional',
      'admin',
      'cliente',
      'executivo'
    );
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where n.nspname = 'public'
      and t.typname = 'health_record_category'
  ) then
    create type public.health_record_category as enum (
      'perfil_clinico',
      'medicamento',
      'vacina',
      'sinais_vitais',
      'exame',
      'evolucao'
    );
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where n.nspname = 'public'
      and t.typname = 'sae_section'
  ) then
    create type public.sae_section as enum (
      'coleta',
      'diagnosticos',
      'planejamento',
      'prescricoes',
      'avaliacao'
    );
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where n.nspname = 'public'
      and t.typname = 'sae_status'
  ) then
    create type public.sae_status as enum (
      'aberto',
      'em_andamento',
      'concluido',
      'cancelado'
    );
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where n.nspname = 'public'
      and t.typname = 'sae_version_status'
  ) then
    create type public.sae_version_status as enum (
      'rascunho',
      'publicada'
    );
  end if;
end
$$;

-- ============================================================================
-- RBAC — GRUPOS DE PERMISSÕES
-- ============================================================================

create table if not exists public.permission_groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================================
-- RBAC — PERMISSÕES
-- ============================================================================

create table if not exists public.permissions (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  resource text not null,
  action text not null,
  description text,
  group_id uuid references public.permission_groups(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================================
-- RBAC — ROLES
-- ============================================================================

create table if not exists public.roles (
  id uuid primary key default gen_random_uuid(),
  key public.app_role not null unique,
  name text not null,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================================
-- RBAC — PERMISSÕES POR ROLE
-- ============================================================================

create table if not exists public.role_permissions (
  id uuid primary key default gen_random_uuid(),
  role public.app_role not null,
  permission_id uuid not null
    references public.permissions(id)
    on delete cascade,
  created_at timestamptz not null default now(),
  unique (role, permission_id)
);

-- ============================================================================
-- RBAC — ROLES DOS USUÁRIOS
-- ============================================================================

create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

create index if not exists idx_user_roles_user_id
  on public.user_roles(user_id);

create index if not exists idx_user_roles_role
  on public.user_roles(role);

-- ============================================================================
-- RBAC — HELPERS
-- ============================================================================

create or replace function public.has_role(
  _user_id uuid,
  _role text
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = _user_id
      and lower(role::text) = lower(_role)
  );
$$;

create or replace function public.is_gestao(
  _user_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.has_role(_user_id, 'admin')
    or public.has_role(_user_id, 'executivo');
$$;

-- ============================================================================
-- SAE — REGISTROS PRINCIPAIS
-- ============================================================================

create table if not exists public.sae_records (
  id uuid primary key default gen_random_uuid(),

  patient_id uuid not null,
  professional_id uuid not null,

  title text not null,

  status public.sae_status not null default 'aberto',

  historico jsonb not null default '{}'::jsonb,
  vital_signs jsonb not null default '{}'::jsonb,
  diagnosticos jsonb not null default '[]'::jsonb,
  planejamento jsonb not null default '[]'::jsonb,
  prescricoes jsonb not null default '[]'::jsonb,

  avaliacao text,

  opened_at timestamptz not null default now(),
  closed_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_sae_records_patient_id
  on public.sae_records(patient_id);

create index if not exists idx_sae_records_professional_id
  on public.sae_records(professional_id);

create index if not exists idx_sae_records_status
  on public.sae_records(status);

create index if not exists idx_sae_records_opened_at
  on public.sae_records(opened_at desc);

-- ============================================================================
-- SAE — EVOLUÇÕES
-- ============================================================================

create table if not exists public.sae_evolutions (
  id uuid primary key default gen_random_uuid(),

  sae_record_id uuid not null
    references public.sae_records(id)
    on delete cascade,

  patient_id uuid not null,
  professional_id uuid not null,

  content text not null,

  procedures jsonb not null default '[]'::jsonb,
  vital_signs jsonb not null default '{}'::jsonb,

  created_at timestamptz not null default now()
);

create index if not exists idx_sae_evolutions_record_id
  on public.sae_evolutions(sae_record_id);

create index if not exists idx_sae_evolutions_patient_id
  on public.sae_evolutions(patient_id);

create index if not exists idx_sae_evolutions_professional_id
  on public.sae_evolutions(professional_id);

-- ============================================================================
-- SAE — VERSÕES DE SEÇÕES
-- ============================================================================

create table if not exists public.sae_section_versions (
  id uuid primary key default gen_random_uuid(),

  sae_record_id uuid not null
    references public.sae_records(id)
    on delete cascade,

  section public.sae_section not null,

  payload jsonb not null default '{}'::jsonb,

  author_id uuid not null,

  status public.sae_version_status not null default 'rascunho',

  version_number integer not null default 1,

  note text,

  created_at timestamptz not null default now(),

  unique (sae_record_id, section, version_number)
);

create index if not exists idx_sae_versions_record_id
  on public.sae_section_versions(sae_record_id);

create index if not exists idx_sae_versions_section
  on public.sae_section_versions(section);

-- ============================================================================
-- PRONTUÁRIO — HEALTH RECORDS
-- ============================================================================

create table if not exists public.health_records (
  id uuid primary key default gen_random_uuid(),

  patient_id uuid not null,

  author_id uuid,

  category public.health_record_category not null,

  title text not null,

  content text,

  data jsonb,

  attachment_url text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_health_records_patient_id
  on public.health_records(patient_id);

create index if not exists idx_health_records_author_id
  on public.health_records(author_id);

create index if not exists idx_health_records_category
  on public.health_records(category);

-- ============================================================================
-- UPDATED_AT
-- ============================================================================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_permission_groups_updated_at
  on public.permission_groups;

create trigger trg_permission_groups_updated_at
before update on public.permission_groups
for each row
execute function public.set_updated_at();

drop trigger if exists trg_permissions_updated_at
  on public.permissions;

create trigger trg_permissions_updated_at
before update on public.permissions
for each row
execute function public.set_updated_at();

drop trigger if exists trg_roles_updated_at
  on public.roles;

create trigger trg_roles_updated_at
before update on public.roles
for each row
execute function public.set_updated_at();

drop trigger if exists trg_sae_records_updated_at
  on public.sae_records;

create trigger trg_sae_records_updated_at
before update on public.sae_records
for each row
execute function public.set_updated_at();

drop trigger if exists trg_health_records_updated_at
  on public.health_records;

create trigger trg_health_records_updated_at
before update on public.health_records
for each row
execute function public.set_updated_at();

-- ============================================================================
-- RLS
-- ============================================================================
--
-- Nesta primeira reconstrução usamos o mesmo princípio já confirmado pelo
-- projeto: autenticação obrigatória e autorização administrativa/clínica.
--
-- A autorização fina das operações SAE será consolidada nas policies abaixo.
-- ============================================================================

alter table public.permission_groups enable row level security;
alter table public.permissions enable row level security;
alter table public.roles enable row level security;
alter table public.role_permissions enable row level security;
alter table public.user_roles enable row level security;

alter table public.sae_records enable row level security;
alter table public.sae_evolutions enable row level security;
alter table public.sae_section_versions enable row level security;
alter table public.health_records enable row level security;

-- ============================================================================
-- RBAC POLICIES
-- ============================================================================

drop policy if exists "rbac groups authenticated read"
  on public.permission_groups;

create policy "rbac groups authenticated read"
on public.permission_groups
for select
to authenticated
using (true);

drop policy if exists "rbac permissions authenticated read"
  on public.permissions;

create policy "rbac permissions authenticated read"
on public.permissions
for select
to authenticated
using (true);

drop policy if exists "rbac roles authenticated read"
  on public.roles;

create policy "rbac roles authenticated read"
on public.roles
for select
to authenticated
using (true);

drop policy if exists "rbac role permissions authenticated read"
  on public.role_permissions;

create policy "rbac role permissions authenticated read"
on public.role_permissions
for select
to authenticated
using (true);

drop policy if exists "rbac user roles self read"
  on public.user_roles;

create policy "rbac user roles self read"
on public.user_roles
for select
to authenticated
using (
  user_id = auth.uid()
  or public.has_role(auth.uid(), 'admin')
);

-- Administração de roles somente para admin.
drop policy if exists "rbac user roles admin insert"
  on public.user_roles;

create policy "rbac user roles admin insert"
on public.user_roles
for insert
to authenticated
with check (
  public.has_role(auth.uid(), 'admin')
);

drop policy if exists "rbac user roles admin update"
  on public.user_roles;

create policy "rbac user roles admin update"
on public.user_roles
for update
to authenticated
using (
  public.has_role(auth.uid(), 'admin')
)
with check (
  public.has_role(auth.uid(), 'admin')
);

drop policy if exists "rbac user roles admin delete"
  on public.user_roles;

create policy "rbac user roles admin delete"
on public.user_roles
for delete
to authenticated
using (
  public.has_role(auth.uid(), 'admin')
);

-- ============================================================================
-- SAE — LEITURA
-- ============================================================================

drop policy if exists "sae records clinical read"
  on public.sae_records;

create policy "sae records clinical read"
on public.sae_records
for select
to authenticated
using (
  public.has_role(auth.uid(), 'admin')
  or public.has_role(auth.uid(), 'profissional')
);

drop policy if exists "sae evolutions clinical read"
  on public.sae_evolutions;

create policy "sae evolutions clinical read"
on public.sae_evolutions
for select
to authenticated
using (
  public.has_role(auth.uid(), 'admin')
  or public.has_role(auth.uid(), 'profissional')
);

drop policy if exists "sae versions clinical read"
  on public.sae_section_versions;

create policy "sae versions clinical read"
on public.sae_section_versions
for select
to authenticated
using (
  public.has_role(auth.uid(), 'admin')
  or public.has_role(auth.uid(), 'profissional')
);

-- ============================================================================
-- SAE — CRIAÇÃO
-- ============================================================================

drop policy if exists "sae records clinical insert"
  on public.sae_records;

create policy "sae records clinical insert"
on public.sae_records
for insert
to authenticated
with check (
  public.has_role(auth.uid(), 'admin')
  or (
    public.has_role(auth.uid(), 'profissional')
    and professional_id = auth.uid()
  )
);

drop policy if exists "sae evolutions clinical insert"
  on public.sae_evolutions;

create policy "sae evolutions clinical insert"
on public.sae_evolutions
for insert
to authenticated
with check (
  public.has_role(auth.uid(), 'admin')
  or (
    public.has_role(auth.uid(), 'profissional')
    and professional_id = auth.uid()
  )
);

drop policy if exists "sae versions clinical insert"
  on public.sae_section_versions;

create policy "sae versions clinical insert"
on public.sae_section_versions
for insert
to authenticated
with check (
  public.has_role(auth.uid(), 'admin')
  or (
    public.has_role(auth.uid(), 'profissional')
    and author_id = auth.uid()
  )
);

-- ============================================================================
-- SAE — EDIÇÃO
-- ============================================================================

drop policy if exists "sae records clinical update"
  on public.sae_records;

create policy "sae records clinical update"
on public.sae_records
for update
to authenticated
using (
  public.has_role(auth.uid(), 'admin')
  or (
    public.has_role(auth.uid(), 'profissional')
    and professional_id = auth.uid()
  )
)
with check (
  public.has_role(auth.uid(), 'admin')
  or (
    public.has_role(auth.uid(), 'profissional')
    and professional_id = auth.uid()
  )
);

-- ============================================================================
-- SAE — EXCLUSÃO
-- ============================================================================

drop policy if exists "sae records admin delete"
  on public.sae_records;

create policy "sae records admin delete"
on public.sae_records
for delete
to authenticated
using (
  public.has_role(auth.uid(), 'admin')
);

drop policy if exists "sae versions admin delete"
  on public.sae_section_versions;

create policy "sae versions admin delete"
on public.sae_section_versions
for delete
to authenticated
using (
  public.has_role(auth.uid(), 'admin')
);

-- ============================================================================
-- HEALTH RECORDS
-- ============================================================================

drop policy if exists "health records clinical read"
  on public.health_records;

create policy "health records clinical read"
on public.health_records
for select
to authenticated
using (
  public.has_role(auth.uid(), 'admin')
  or public.has_role(auth.uid(), 'profissional')
  or author_id = auth.uid()
);

drop policy if exists "health records clinical insert"
  on public.health_records;

create policy "health records clinical insert"
on public.health_records
for insert
to authenticated
with check (
  public.has_role(auth.uid(), 'admin')
  or (
    public.has_role(auth.uid(), 'profissional')
    and author_id = auth.uid()
  )
);

-- ============================================================================
-- GRANTS
-- ============================================================================

grant usage on type public.app_role to authenticated;
grant usage on type public.health_record_category to authenticated;
grant usage on type public.sae_section to authenticated;
grant usage on type public.sae_status to authenticated;
grant usage on type public.sae_version_status to authenticated;

grant select on
  public.permission_groups,
  public.permissions,
  public.roles,
  public.role_permissions,
  public.user_roles,
  public.sae_records,
  public.sae_evolutions,
  public.sae_section_versions,
  public.health_records
to authenticated;

grant insert, update, delete on
  public.user_roles
to authenticated;

grant insert, update, delete on
  public.sae_records
to authenticated;

grant insert on
  public.sae_evolutions,
  public.sae_section_versions,
  public.health_records
to authenticated;

grant update on
  public.sae_section_versions,
  public.health_records
to authenticated;

grant delete on
  public.sae_section_versions
to authenticated;

-- ============================================================================
-- DADOS BASE DOS ROLES
-- ============================================================================

insert into public.roles (key, name, description)
values
  ('admin', 'Administrador', 'Acesso administrativo completo'),
  ('executivo', 'Executivo', 'Gestão executiva'),
  ('profissional', 'Profissional', 'Profissional assistencial'),
  ('paciente', 'Paciente', 'Usuário paciente'),
  ('cliente', 'Cliente', 'Usuário cliente'),
  ('familiar', 'Familiar', 'Usuário familiar')
on conflict (key) do nothing;

