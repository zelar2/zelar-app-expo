-- ============================================================
-- ZELAR+ — HARDENING DO HELPER RBAC
-- ============================================================
-- O helper é usado pelas policies RLS da SAE.
--
-- Segurança:
--   authenticated -> pode executar
--   anon          -> NÃO pode executar
--
-- O helper permanece SECURITY DEFINER e com search_path
-- restrito a public.
-- ============================================================

revoke execute
on function public.has_permission(uuid, text)
from public;

revoke execute
on function public.has_permission(uuid, text)
from anon;

grant execute
on function public.has_permission(uuid, text)
to authenticated;
