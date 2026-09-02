-- Bootstrap controlado do primeiro administrador do ZELAR+.
-- Só executa quando ainda não existe nenhum registro em user_roles.
-- Usa o primeiro usuário criado no Supabase Auth.

insert into public.user_roles (user_id, role)
select
  u.id,
  'admin'::public.app_role
from auth.users u
where not exists (
  select 1
  from public.user_roles
)
order by u.created_at
limit 1
on conflict (user_id, role) do nothing;
