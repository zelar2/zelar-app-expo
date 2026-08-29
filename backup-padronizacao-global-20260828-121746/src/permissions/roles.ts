// Idêntico ao original src/permissions/roles.ts
export const ROLES = {
  ADMIN: "admin",
  EXECUTIVO: "executivo",
  SUPORTE: "suporte",
  PROFISSIONAL: "profissional",
  PACIENTE: "paciente",
  CLIENTE: "cliente",
  FAMILIAR: "familiar",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];
