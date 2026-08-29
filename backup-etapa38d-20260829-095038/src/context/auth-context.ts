// Porta fiel de src/context/auth-context.ts (idêntico ao original — lógica não depende do DOM).
import { createContext, useContext } from "react";
import type { Session, User } from "@supabase/supabase-js";

export type AppRole =
  "admin" | "executivo" | "suporte" | "profissional" | "paciente" | "cliente" | "familiar";

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  /** Papel principal (minúsculo) do usuário autenticado. */
  role: AppRole | null;
  /** Alias de `role`, mantido por compatibilidade. */
  userRole: AppRole | null;
  /** Todos os papéis atribuídos ao usuário. */
  roles: AppRole[];
  hasRole: (role: string | string[]) => boolean;
  loading: boolean;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth precisa estar dentro do AuthProvider");
  }

  return context;
}
