import { useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";

import { AuthContext, type AppRole } from "./auth-context";
import { supabase } from "../lib/supabase";

const ROLE_PRIORITY: AppRole[] = [
  "admin",
  "executivo",
  "suporte",
  "profissional",
  "familiar",
  "cliente",
  "paciente",
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadRoles(userId: string): Promise<AppRole[]> {
    try {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId);

      if (error) throw error;

      return ((data ?? []) as { role: string }[])
        .map(({ role }) => role.toLowerCase())
        .filter(
          (role): role is AppRole =>
            ROLE_PRIORITY.includes(role as AppRole),
        );
    } catch (error) {
      console.error("Erro ao carregar papéis do usuário:", error);
      return [];
    }
  }

  useEffect(() => {
    let mounted = true;

    async function applySession(nextSession: Session | null) {
      if (!mounted) return;

      setSession(nextSession);
      setUser(nextSession?.user ?? null);

      if (!nextSession?.user) {
        setRoles([]);
        return;
      }

      const nextRoles = await loadRoles(nextSession.user.id);

      if (mounted) {
        setRoles(nextRoles);
      }
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      void applySession(nextSession);
    });

    async function initializeAuth() {
      try {
        const {
          data: { session: currentSession },
        } = await supabase.auth.getSession();

        await applySession(currentSession);
      } catch (error) {
        console.error("Erro ao inicializar autenticação:", error);

        if (mounted) {
          setSession(null);
          setUser(null);
          setRoles([]);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    void initializeAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const role =
    ROLE_PRIORITY.find((candidate) => roles.includes(candidate)) ?? null;

  function hasRole(target: string | string[]) {
    const wanted = (Array.isArray(target) ? target : [target]).map((value) =>
      value.toLowerCase(),
    );

    return roles.some((currentRole) => wanted.includes(currentRole));
  }

  async function signOut() {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setRoles([]);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        role,
        userRole: role,
        roles,
        hasRole,
        loading,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
