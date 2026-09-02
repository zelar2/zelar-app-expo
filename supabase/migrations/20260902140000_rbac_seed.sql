-- ============================================================================
-- ZELAR+ — SEED RBAC
-- Dados derivados exclusivamente de src/permissions/permissions.ts
-- Não adiciona o papel "suporte", pois ele não existe no enum public.app_role.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- GRUPOS
-- ----------------------------------------------------------------------------

insert into public.permission_groups (name, description)
select 'Administração', 'Permissões administrativas e gestão de usuários'
where not exists (
  select 1 from public.permission_groups
  where name = 'Administração'
);

insert into public.permission_groups (name, description)
select 'Profissionais', 'Gestão e aprovação de profissionais'
where not exists (
  select 1 from public.permission_groups
  where name = 'Profissionais'
);

insert into public.permission_groups (name, description)
select 'Financeiro', 'Permissões relacionadas ao módulo financeiro'
where not exists (
  select 1 from public.permission_groups
  where name = 'Financeiro'
);

insert into public.permission_groups (name, description)
select 'Relatórios', 'Consulta de relatórios'
where not exists (
  select 1 from public.permission_groups
  where name = 'Relatórios'
);

insert into public.permission_groups (name, description)
select 'Escalas', 'Consulta e gestão de escalas'
where not exists (
  select 1 from public.permission_groups
  where name = 'Escalas'
);

insert into public.permission_groups (name, description)
select 'Configurações', 'Configurações do sistema'
where not exists (
  select 1 from public.permission_groups
  where name = 'Configurações'
);

insert into public.permission_groups (name, description)
select 'Auditoria', 'Consulta de auditoria'
where not exists (
  select 1 from public.permission_groups
  where name = 'Auditoria'
);

insert into public.permission_groups (name, description)
select 'SAE', 'Sistematização da Assistência de Enfermagem'
where not exists (
  select 1 from public.permission_groups
  where name = 'SAE'
);

-- ----------------------------------------------------------------------------
-- PERMISSÕES
-- ----------------------------------------------------------------------------

insert into public.permissions
  (key, resource, action, description, group_id)
select
  v.key,
  v.resource,
  v.action,
  v.description,
  pg.id
from (
  values
    ('admin.dashboard',       'admin',          'dashboard', 'Acessar dashboard administrativo', 'Administração'),
    ('usuarios.visualizar',   'usuarios',       'visualizar', 'Visualizar usuários', 'Administração'),
    ('usuarios.criar',        'usuarios',       'criar', 'Criar usuários', 'Administração'),
    ('usuarios.editar',       'usuarios',       'editar', 'Editar usuários', 'Administração'),
    ('usuarios.excluir',      'usuarios',       'excluir', 'Excluir usuários', 'Administração'),

    ('profissionais.aprovar', 'profissionais', 'aprovar', 'Aprovar profissionais', 'Profissionais'),

    ('financeiro.visualizar', 'financeiro',     'visualizar', 'Visualizar financeiro', 'Financeiro'),

    ('relatorios.visualizar', 'relatorios',     'visualizar', 'Visualizar relatórios', 'Relatórios'),

    ('escalas.visualizar',    'escalas',        'visualizar', 'Visualizar escalas', 'Escalas'),

    ('configuracoes.visualizar', 'configuracoes', 'visualizar',
      'Visualizar configurações', 'Configurações'),

    ('auditoria.visualizar',   'auditoria',      'visualizar', 'Visualizar auditoria', 'Auditoria'),

    ('sae.visualizar',         'sae',            'visualizar', 'Visualizar SAE', 'SAE'),
    ('sae.criar',              'sae',            'criar', 'Criar registros SAE', 'SAE'),
    ('sae.editar',             'sae',            'editar', 'Editar registros SAE', 'SAE'),
    ('sae.excluir',            'sae',            'excluir', 'Excluir registros SAE', 'SAE'),
    ('sae.evolucao',           'sae',            'evolucao', 'Registrar evolução SAE', 'SAE'),
    ('sae.versao',             'sae',            'versao', 'Gerenciar versões SAE', 'SAE')
) as v(key, resource, action, description, group_name)
join public.permission_groups pg
  on pg.name = v.group_name
where not exists (
  select 1
  from public.permissions p
  where p.key = v.key
);

-- ----------------------------------------------------------------------------
-- ROLE_PERMISSIONS
--
-- Correspondência com ROLE_PERMISSIONS do código:
--
-- admin:
--   todas as permissões
--
-- executivo:
--   usuarios.visualizar
--   relatorios.visualizar
--   financeiro.visualizar
--   auditoria.visualizar
--
-- profissional:
--   escalas.visualizar
--   relatorios.visualizar
--   sae.visualizar
--   sae.criar
--   sae.editar
--   sae.evolucao
--   sae.versao
--
-- paciente / cliente / familiar:
--   nenhuma
--
-- suporte:
--   NÃO inserido, pois "suporte" não existe em public.app_role.
-- ----------------------------------------------------------------------------

insert into public.role_permissions (role, permission_id)
select
  r.key,
  p.id
from public.roles r
cross join public.permissions p
where r.key = 'admin'
  and not exists (
    select 1
    from public.role_permissions rp
    where rp.role = r.key
      and rp.permission_id = p.id
  );

insert into public.role_permissions (role, permission_id)
select
  r.key,
  p.id
from public.roles r
join public.permissions p
  on p.key in (
    'usuarios.visualizar',
    'relatorios.visualizar',
    'financeiro.visualizar',
    'auditoria.visualizar'
  )
where r.key = 'executivo'
  and not exists (
    select 1
    from public.role_permissions rp
    where rp.role = r.key
      and rp.permission_id = p.id
  );

insert into public.role_permissions (role, permission_id)
select
  r.key,
  p.id
from public.roles r
join public.permissions p
  on p.key in (
    'escalas.visualizar',
    'relatorios.visualizar',
    'sae.visualizar',
    'sae.criar',
    'sae.editar',
    'sae.evolucao',
    'sae.versao'
  )
where r.key = 'profissional'
  and not exists (
    select 1
    from public.role_permissions rp
    where rp.role = r.key
      and rp.permission_id = p.id
  );

-- ----------------------------------------------------------------------------
-- VERIFICAÇÃO
-- ----------------------------------------------------------------------------

do $$
declare
  v_groups integer;
  v_permissions integer;
  v_role_permissions integer;
begin
  select count(*) into v_groups
  from public.permission_groups;

  select count(*) into v_permissions
  from public.permissions;

  select count(*) into v_role_permissions
  from public.role_permissions;

  raise notice 'RBAC seed: % grupos, % permissões, % vínculos',
    v_groups, v_permissions, v_role_permissions;
end
$$;
