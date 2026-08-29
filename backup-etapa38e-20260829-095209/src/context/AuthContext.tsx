// Compatibilidade legada.
// A implementação oficial está em ./auth-context.ts.
// Novos imports devem usar "@/context/auth-context".

export {
  AuthContext,
  AuthProvider,
  useAuth,
} from "./auth-context";

export type {
  AppRole,
  AuthContextType,
} from "./auth-context";
