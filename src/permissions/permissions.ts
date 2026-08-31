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

  // SAE — Sistematização da Assistência de Enfermagem
  SAE_VIEW: "sae.visualizar",
  SAE_CREATE: "sae.criar",
  SAE_EDIT: "sae.editar",
  SAE_DELETE: "sae.excluir",
  SAE_EVOLUTION: "sae.evolucao",
  SAE_VERSION: "sae.versao",
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

  profissional: [
    PERMISSIONS.SCALE_VIEW,
    PERMISSIONS.REPORTS_VIEW,
    PERMISSIONS.SAE_VIEW,
    PERMISSIONS.SAE_CREATE,
    PERMISSIONS.SAE_EDIT,
    PERMISSIONS.SAE_EVOLUTION,
    PERMISSIONS.SAE_VERSION,
  ],

  paciente: [],
  cliente: [],
  familiar: [],
};

export type { Role } from "./roles";
