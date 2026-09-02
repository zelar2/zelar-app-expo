import { createContext } from "react";
import type { Session, User } from "@supabase/supabase-js";

export type AppRole =
  | "admin"
  | "executivo"
  | "suporte"
  | "profissional"
  | "paciente"
  | "cliente"
  | "familiar";

export interface AuthContextValue {
  user: User | null;
  session: Session | null;
  role: AppRole | null;
  userRole: AppRole | null;
  roles: AppRole[];
  hasRole: (target: string | string[]) => boolean;
  loading: boolean;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined,
);
