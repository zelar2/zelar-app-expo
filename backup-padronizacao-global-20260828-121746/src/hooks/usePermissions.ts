import { useAuth } from "@/context/auth-context";
import { ROLE_PERMISSIONS, type Permission } from "@/permissions/permissions";

export function usePermissions() {
  const { role } = useAuth();

  function can(permission: Permission) {
    if (!role) return false;
    return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
  }

  return { can };
}
