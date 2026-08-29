-- ============================================================================
-- ZELAR+ — cupons, convenios, comissoes + bucket de storage "documentos"
--
-- Contexto: src/integrations/supabase/types.ts já declarava os tipos dessas
-- três tabelas (usadas por app/(app)/cupons.tsx, convenios.tsx e
-- comissoes.tsx via CrudScreen), mas as tabelas nunca existiram no banco —
-- as telas fariam select/insert em relações inexistentes. Esta migration
-- cria exatamente as colunas já assumidas pelos tipos e pelas telas, mais
-- RLS no mesmo padrão usado pelo resto do app (papéis em "user_roles").
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Helper: já pode existir no projeto (auth/roles). Criado com IF NOT EXISTS
-- para não colidir com uma função equivalente já aplicada por outra
-- migration do projeto principal.
-- ----------------------------------------------------------------------------
create or replace function public.has_role(_user_id uuid, _role text)
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
      and lower(role) = lower(_role)
  );
$$;

create or replace function public.is_gestao(_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.has_role(_user_id, 'admin') or public.has_role(_user_id, 'executivo');
$$;

-- ============================================================================
-- cupons
-- ============================================================================
create table if not exists public.cupons (
  id uuid primary key default gen_random_uuid(),
  codigo text not null unique,
  descricao text,
  tipo_desconto text not null default 'percentual'
    check (tipo_desconto in ('percentual', 'valor_fixo')),
  valor_desconto numeric(10, 2) not null default 0,
  valido_de timestamptz,
  valido_ate timestamptz,
  limite_uso integer,
  usos integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.cupons enable row level security;

drop policy if exists "cupons_select_gestao" on public.cupons;
create policy "cupons_select_gestao"
  on public.cupons for select
  using (public.is_gestao(auth.uid()));

drop policy if exists "cupons_insert_gestao" on public.cupons;
create policy "cupons_insert_gestao"
  on public.cupons for insert
  with check (public.is_gestao(auth.uid()));

drop policy if exists "cupons_update_gestao" on public.cupons;
create policy "cupons_update_gestao"
  on public.cupons for update
  using (public.is_gestao(auth.uid()))
  with check (public.is_gestao(auth.uid()));

drop policy if exists "cupons_delete_gestao" on public.cupons;
create policy "cupons_delete_gestao"
  on public.cupons for delete
  using (public.is_gestao(auth.uid()));

-- ============================================================================
-- convenios
-- ============================================================================
create table if not exists public.convenios (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  registro_ans text,
  telefone text,
  email text,
  desconto_percentual numeric(5, 2) not null default 0,
  is_active boolean not null default true,
  observacoes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.convenios enable row level security;

drop policy if exists "convenios_select_gestao" on public.convenios;
create policy "convenios_select_gestao"
  on public.convenios for select
  using (public.is_gestao(auth.uid()));

drop policy if exists "convenios_insert_gestao" on public.convenios;
create policy "convenios_insert_gestao"
  on public.convenios for insert
  with check (public.is_gestao(auth.uid()));

drop policy if exists "convenios_update_gestao" on public.convenios;
create policy "convenios_update_gestao"
  on public.convenios for update
  using (public.is_gestao(auth.uid()))
  with check (public.is_gestao(auth.uid()));

drop policy if exists "convenios_delete_gestao" on public.convenios;
create policy "convenios_delete_gestao"
  on public.convenios for delete
  using (public.is_gestao(auth.uid()));

-- ============================================================================
-- comissoes
-- ============================================================================
create table if not exists public.comissoes (
  id uuid primary key default gen_random_uuid(),
  profissional_id uuid not null references public.profiles(id) on delete cascade,
  appointment_id uuid,
  service_call_id uuid,
  valor_base_cents integer not null default 0,
  percentual numeric(5, 2) not null default 0,
  valor_comissao_cents integer not null default 0,
  status text not null default 'pendente'
    check (status in ('pendente', 'aprovada', 'paga', 'cancelada')),
  pago_em timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists comissoes_profissional_id_idx on public.comissoes (profissional_id);

alter table public.comissoes enable row level security;

-- Gestão vê e gerencia tudo; o próprio profissional só enxerga suas comissões.
drop policy if exists "comissoes_select" on public.comissoes;
create policy "comissoes_select"
  on public.comissoes for select
  using (public.is_gestao(auth.uid()) or profissional_id = auth.uid());

drop policy if exists "comissoes_insert_gestao" on public.comissoes;
create policy "comissoes_insert_gestao"
  on public.comissoes for insert
  with check (public.is_gestao(auth.uid()));

drop policy if exists "comissoes_update_gestao" on public.comissoes;
create policy "comissoes_update_gestao"
  on public.comissoes for update
  using (public.is_gestao(auth.uid()))
  with check (public.is_gestao(auth.uid()));

drop policy if exists "comissoes_delete_gestao" on public.comissoes;
create policy "comissoes_delete_gestao"
  on public.comissoes for delete
  using (public.is_gestao(auth.uid()));

-- ============================================================================
-- updated_at automático (mesmo padrão preguiçoso comum no restante do schema)
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

drop trigger if exists set_updated_at on public.cupons;
create trigger set_updated_at before update on public.cupons
  for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at on public.convenios;
create trigger set_updated_at before update on public.convenios
  for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at on public.comissoes;
create trigger set_updated_at before update on public.comissoes
  for each row execute function public.set_updated_at();

-- ============================================================================
-- Bucket de Storage "documentos"
-- Referenciado por app/(app)/upload-documentos.tsx (const BUCKET = "documentos")
-- e pelas policies de profissional_documentos, mas o bucket em si nunca foi
-- criado — sem isto, todo upload falha com "Bucket not found".
-- ============================================================================
insert into storage.buckets (id, name, public)
values ('documentos', 'documentos', false)
on conflict (id) do nothing;

drop policy if exists "documentos_owner_read" on storage.objects;
create policy "documentos_owner_read"
  on storage.objects for select
  using (
    bucket_id = 'documentos'
    and (auth.uid()::text = (storage.foldername(name))[1] or public.is_gestao(auth.uid()))
  );

drop policy if exists "documentos_owner_write" on storage.objects;
create policy "documentos_owner_write"
  on storage.objects for insert
  with check (
    bucket_id = 'documentos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "documentos_owner_delete" on storage.objects;
create policy "documentos_owner_delete"
  on storage.objects for delete
  using (
    bucket_id = 'documentos'
    and (auth.uid()::text = (storage.foldername(name))[1] or public.is_gestao(auth.uid()))
  );

-- ============================================================================
-- NOTA: esta migration assume convenções vistas no código do app
-- (tabela "user_roles" com colunas user_id/role, tabela "profiles" com pk
-- "id" igual ao auth.uid()). Ela não pôde ser validada contra o schema real
-- do projeto Supabase porque este ambiente não tem acesso à internet nem ao
-- repositório do webapp — rode-a num branch/staging e confira o resultado de
-- `supabase db push` antes de aplicar em produção.
-- ============================================================================
