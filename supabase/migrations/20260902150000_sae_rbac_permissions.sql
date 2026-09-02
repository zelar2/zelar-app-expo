-- ============================================================
-- ZELAR+ — SAE RBAC POR PERMISSÃO
-- ============================================================
-- Substitui autorização baseada apenas em role por permissões
-- granulares sae.*.
--
-- Regras:
--   sae.visualizar -> leitura
--   sae.criar      -> criação
--   sae.editar     -> edição
--   sae.excluir    -> exclusão administrativa
--   sae.evolucao   -> criação de evolução
--   sae.versao     -> criação/leitura/trabalho com versões
--
-- Regra de propriedade:
--   profissional atua sobre seus próprios registros/versões.
--   admin possui todas as permissões e pode atuar administrativamente.
-- ============================================================

-- ------------------------------------------------------------
-- 1. Helper central de permissão
-- ------------------------------------------------------------

create or replace function public.has_permission(
  _user_id uuid,
  _permission_key text
)
returns boolean
language sql
stable
security definer
set search_path = public
as $function$
  select exists (
    select 1
    from public.user_roles ur
    join public.role_permissions rp
      on rp.role = ur.role
    join public.permissions p
      on p.id = rp.permission_id
    where ur.user_id = _user_id
      and p.key = _permission_key
  );
$function$;

revoke all on function public.has_permission(uuid, text) from public;
grant execute on function public.has_permission(uuid, text) to authenticated;

-- ------------------------------------------------------------
-- 2. SAE RECORDS
-- ------------------------------------------------------------

drop policy if exists "sae records admin delete"
  on public.sae_records;

drop policy if exists "sae records clinical insert"
  on public.sae_records;

drop policy if exists "sae records clinical read"
  on public.sae_records;

drop policy if exists "sae records clinical update"
  on public.sae_records;

create policy "sae records permission read"
on public.sae_records
for select
to authenticated
using (
  public.has_permission(auth.uid(), 'sae.visualizar')
);

create policy "sae records permission insert"
on public.sae_records
for insert
to authenticated
with check (
  public.has_permission(auth.uid(), 'sae.criar')
  and (
    professional_id = auth.uid()
    or public.has_permission(auth.uid(), 'sae.excluir')
  )
);

create policy "sae records permission update"
on public.sae_records
for update
to authenticated
using (
  public.has_permission(auth.uid(), 'sae.editar')
  and (
    professional_id = auth.uid()
    or public.has_permission(auth.uid(), 'sae.excluir')
  )
)
with check (
  public.has_permission(auth.uid(), 'sae.editar')
  and (
    professional_id = auth.uid()
    or public.has_permission(auth.uid(), 'sae.excluir')
  )
);

create policy "sae records permission delete"
on public.sae_records
for delete
to authenticated
using (
  public.has_permission(auth.uid(), 'sae.excluir')
);

-- ------------------------------------------------------------
-- 3. SAE EVOLUTIONS
-- ------------------------------------------------------------

drop policy if exists "sae evolutions clinical insert"
  on public.sae_evolutions;

drop policy if exists "sae evolutions clinical read"
  on public.sae_evolutions;

create policy "sae evolutions permission read"
on public.sae_evolutions
for select
to authenticated
using (
  public.has_permission(auth.uid(), 'sae.visualizar')
);

create policy "sae evolutions permission insert"
on public.sae_evolutions
for insert
to authenticated
with check (
  public.has_permission(auth.uid(), 'sae.evolucao')
  and (
    professional_id = auth.uid()
    or public.has_permission(auth.uid(), 'sae.excluir')
  )
);

-- ------------------------------------------------------------
-- 4. SAE SECTION VERSIONS
-- ------------------------------------------------------------

drop policy if exists "sae versions admin delete"
  on public.sae_section_versions;

drop policy if exists "sae versions clinical insert"
  on public.sae_section_versions;

drop policy if exists "sae versions clinical read"
  on public.sae_section_versions;

create policy "sae versions permission read"
on public.sae_section_versions
for select
to authenticated
using (
  public.has_permission(auth.uid(), 'sae.visualizar')
);

create policy "sae versions permission insert"
on public.sae_section_versions
for insert
to authenticated
with check (
  public.has_permission(auth.uid(), 'sae.versao')
  and (
    author_id = auth.uid()
    or public.has_permission(auth.uid(), 'sae.excluir')
  )
);

create policy "sae versions permission delete"
on public.sae_section_versions
for delete
to authenticated
using (
  public.has_permission(auth.uid(), 'sae.versao')
  and (
    author_id = auth.uid()
    or public.has_permission(auth.uid(), 'sae.excluir')
  )
);

-- ============================================================
-- FIM
-- ============================================================
