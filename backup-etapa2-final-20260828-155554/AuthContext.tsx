// Porta fiel de src/context/AuthContext.tsx — mesma lógica de carregamento de
// sessão e papéis (user_roles no Supabase); nenhuma mudança de comportamento.
import { useContext, useEffect, useState, type ReactNode } from "react";

import { supabase } from "@/integrations/supabase/client";
import { AuthContext, type AppRole } from "@/context/auth-context";
import type { Session, User } from "@supabase/supabase-js";

const ROLE_PRIORITY: AppRole[] = [
  "admin",
  "executivo",
  "suporte",
  "profissional",
  "familiar",
  "cliente",
  "paciente",
];

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
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

      return ((data ?? []) as { role: string }[]).map((r) => r.role.toLowerCase() as AppRole);
    } catch (error) {
      console.error("Erro ao carregar papéis do usuário:", error);
      return [];
    }
  }

  useEffect(() => {
    let mounted = true;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!mounted) return;
      setSession(nextSession);
      setUser(nextSession?.user ?? null);
      if (!nextSession?.user) setRoles([]);
    });

    (async () => {
      const {
        data: { session: currentSession },
      } = await supabase.auth.getSession();

      if (!mounted) return;

      setSession(currentSession);
      setUser(currentSession?.user ?? null);

      if (currentSession?.user) {
        const nextRoles = await loadRoles(currentSession.user.id);
        if (!mounted) return;
        setRoles(nextRoles);
      }

      setLoading(false);
    })();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const userId = user?.id;
  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    (async () => {
      const nextRoles = await loadRoles(userId);
      if (!cancelled) setRoles(nextRoles);
    })();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const role = ROLE_PRIORITY.find((candidate) => roles.includes(candidate)) ?? null;

  function hasRole(target: string | string[]) {
    const wanted = (Array.isArray(target) ? target : [target]).map((r) => r.toLowerCase());
    return roles.some((r) => wanted.includes(r));
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

/**
 * Hook público de autenticação do ZELAR+.
 * Mantém o AuthContext como fonte única da sessão e dos papéis.
 */
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth precisa estar dentro do AuthProvider");
  }

  return context;
}
