// ZELAR+ — Auth Context unificado
// Fonte única de autenticação, sessão e papéis do usuário.
// Compatível com Expo + React Native + Supabase.

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import type { Session, User } from "@supabase/supabase-js";

import { supabase } from "@/integrations/supabase/client";

export type AppRole =
  | "admin"
  | "executivo"
  | "suporte"
  | "profissional"
  | "paciente"
  | "cliente"
  | "familiar";

export interface AuthContextType {
  user: User | null;
  session: Session | null;

  /** Papel principal do usuário autenticado. */
  role: AppRole | null;

  /** Alias de role mantido por compatibilidade. */
  userRole: AppRole | null;

  /** Todos os papéis atribuídos ao usuário. */
  roles: AppRole[];

  /** Verifica se o usuário possui um ou mais papéis. */
  hasRole: (role: string | string[]) => boolean;

  /** Indica se o carregamento inicial da autenticação terminou. */
  loading: boolean;

  /** Encerra a sessão atual. */
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);

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

async function loadRoles(userId: string): Promise<AppRole[]> {
  try {
    const { data, error } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);

    if (error) {
      throw error;
    }

    return ((data ?? []) as { role: string }[])
      .map((item) => item.role.toLowerCase() as AppRole)
      .filter((role) => ROLE_PRIORITY.includes(role));
  } catch (error) {
    console.error("Erro ao carregar papéis do usuário:", error);
    return [];
  }
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function applySession(nextSession: Session | null) {
      if (!mounted) {
        return;
      }

      setSession(nextSession);
      setUser(nextSession?.user ?? null);

      if (!nextSession?.user) {
        setRoles([]);
        setLoading(false);
        return;
      }

      setLoading(true);

      const nextRoles = await loadRoles(nextSession.user.id);

      if (!mounted) {
        return;
      }

      setRoles(nextRoles);
      setLoading(false);
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      void applySession(nextSession);
    });

    (async () => {
      try {
        const {
          data: { session: currentSession },
        } = await supabase.auth.getSession();

        await applySession(currentSession);
      } catch (error) {
        console.error("Erro ao recuperar sessão:", error);

        if (mounted) {
          setSession(null);
          setUser(null);
          setRoles([]);
          setLoading(false);
        }
      }
    })();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const role =
    ROLE_PRIORITY.find((candidate) => roles.includes(candidate)) ?? null;

  function hasRole(target: string | string[]) {
    const wanted = (Array.isArray(target) ? target : [target]).map((item) =>
      item.toLowerCase(),
    );

    return roles.some((item) => wanted.includes(item));
  }

  async function signOut() {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Erro ao encerrar sessão:", error);
      throw error;
    }

    setUser(null);
    setSession(null);
    setRoles([]);
    setLoading(false);
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

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth precisa estar dentro do AuthProvider");
  }

  return context;
}
