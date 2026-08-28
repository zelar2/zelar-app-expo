import { useAuth } from "@/context/auth-context";
import { ROLE_PERMISSIONS, type Permission } from "@/permissions/permissions";

export function usePermission() {
  const { role } = useAuth();

  function can(permission: Permission | string) {
    if (!role) return false;
    return (ROLE_PERMISSIONS[role] as string[] | undefined)?.includes(permission) ?? false;
  }

  return { can };
}
