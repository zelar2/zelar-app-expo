import type { Role } from "./roles";

export const PERMISSIONS = {
  ADMIN_DASHBOARD: "admin.dashboard",

  USERS_VIEW: "usuarios.visualizar",
  USERS_CREATE: "usuarios.criar",
  USERS_EDIT: "usuarios.editar",
  USERS_DELETE: "usuarios.excluir",

  PROFESSIONAL_APPROVE: "profissionais.aprovar",

  FINANCE_VIEW: "financeiro.visualizar",
  REPORTS_VIEW: "relatorios.visualizar",
  SCALE_VIEW: "escalas.visualizar",
  SETTINGS_VIEW: "configuracoes.visualizar",
  AUDIT_VIEW: "auditoria.visualizar",
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  admin: Object.values(PERMISSIONS),

  executivo: [
    PERMISSIONS.USERS_VIEW,
    PERMISSIONS.REPORTS_VIEW,
    PERMISSIONS.FINANCE_VIEW,
    PERMISSIONS.AUDIT_VIEW,
  ],

  suporte: [PERMISSIONS.USERS_VIEW],

  profissional: [PERMISSIONS.SCALE_VIEW, PERMISSIONS.REPORTS_VIEW],

  paciente: [],
  cliente: [],
  familiar: [],
};

export type { Role } from "./roles";
