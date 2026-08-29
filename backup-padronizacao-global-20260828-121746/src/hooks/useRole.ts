import { useAuth } from "@/context/auth-context";

export function useRole() {
  const { role, roles, hasRole, user, loading } = useAuth();

  return { role, roles, hasRole, user, loading };
}
