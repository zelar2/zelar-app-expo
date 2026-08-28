import type { Role } from "@/permissions/permissions";

/**
 * Fonte única de verdade do RBAC de navegação do ZELAR+.
 * Cada rota autenticada declara quais papéis podem abri-la.
 * Usado pelo RouteAccessGuard (bloqueio real) e pelo ModuleMenu (exibição).
 */

export const ALL_ROLES: Role[] = [
  "admin",
  "executivo",
  "suporte",
  "profissional",
  "paciente",
  "cliente",
  "familiar",
];

/** Time interno (clínico + gestão). */
export const STAFF: Role[] = ["admin", "executivo", "profissional"];
/** Gestão / back-office. */
export const GESTAO: Role[] = ["admin", "executivo"];
/** Somente administradores. */
export const ADMIN: Role[] = ["admin"];
/** Lado do cliente (paciente e quem cuida dele). */
export const CLIENTE_SIDE: Role[] = ["paciente", "cliente", "familiar"];
/** Áreas clínicas do profissional (executivo não acessa dados clínicos). */
export const CLINICO: Role[] = ["admin", "profissional"];

export const ROUTE_ACCESS: Record<string, Role[]> = {
  /* Principal */
  "/inicio": ALL_ROLES,
  "/onboarding": ALL_ROLES,
  "/agenda": ALL_ROLES,
  "/mapa": ALL_ROLES,
  "/chamadas": ALL_ROLES,
  "/chat": ALL_ROLES,
  "/mensagens": STAFF,
  "/teleconsulta": ALL_ROLES,
  "/sos": ALL_ROLES,
  "/assistente-ia": ALL_ROLES,
  "/chat-ia": ALL_ROLES,

  /* Painéis */
  "/dashboard-cliente": [...CLIENTE_SIDE, "admin"],
  "/portal-cliente": [...CLIENTE_SIDE, "admin"],
  "/dashboard-profissional": CLINICO,
  "/dashboard-executivo": GESTAO,
  "/admin": ADMIN,
  "/analytics": GESTAO,
  "/relatorios": STAFF,
  "/monitoramento": GESTAO,

  /* Rotas de detalhe/cadastro da assistência */
  "/chamada-detalhe": ALL_ROLES,
  "/cliente-perfil": CLINICO,
  "/profissional-perfil": ALL_ROLES,

  /* Assistência */

  "/clientes": CLINICO,
  "/cliente-detalhes": CLINICO,
  "/cliente-historico": CLINICO,
  "/profissionais": ALL_ROLES,
  "/profissionais-admin": GESTAO,
  "/especialidades": STAFF,
  "/categorias": STAFF,
  "/enfermagem": CLINICO,
  "/prontuario": ALL_ROLES,
  "/atendimentos": CLINICO,
  "/meus-atendimentos": ALL_ROLES,
  "/fila": CLINICO,
  "/avaliacoes": ALL_ROLES,

  /* Documentos */
  "/documentos": ALL_ROLES,
  "/meus-documentos": ALL_ROLES,
  "/upload-documentos": ALL_ROLES,
  "/assinatura-documentos": STAFF,
  "/aprovacoes": GESTAO,
  "/contratos": STAFF,
  "/meus-contratos": ALL_ROLES,

  /* Financeiro */
  "/financeiro": STAFF,
  "/pagamentos": GESTAO,
  "/meus-pagamentos": ALL_ROLES,
  "/faturas": GESTAO,
  "/comissoes": STAFF,
  "/planos": ALL_ROLES,
  "/assinaturas": GESTAO,
  "/cupons": GESTAO,
  "/convenios": GESTAO,
  "/crm-clientes": GESTAO,
  "/funil-vendas": GESTAO,

  /* Telas auxiliares / formulários de Recursos Humanos */
  "/afastamentos-novo": STAFF,
  "/avaliacoes-funcionarios-novo": GESTAO,
  "/banco-horas-novo": STAFF,
  "/colaboradores-novo": GESTAO,
  "/contratos-novo": STAFF,
  "/escalas-novo": STAFF,
  "/ferias-novo": STAFF,
  "/folha-pagamento-novo": ADMIN,

  /* Recursos humanos */

  "/colaboradores": GESTAO,
  "/escalas": STAFF,
  "/banco-horas": STAFF,
  "/ferias": STAFF,
  "/afastamentos": STAFF,
  "/folha-pagamento": ADMIN,
  "/avaliacoes-funcionarios": GESTAO,

  /* Notificações e suporte */
  "/notificacoes": ALL_ROLES,
  "/central-notificacoes": GESTAO,
  "/notificacoes-tempo-real": GESTAO,
  "/suporte": ALL_ROLES,
  "/chamados": ALL_ROLES,

  /* Detalhes administrativos */
  "/usuarios-detalhe": GESTAO,

  /* Conta e sistema */

  "/perfil": ALL_ROLES,
  "/minha-conta": ALL_ROLES,
  "/configuracoes": ALL_ROLES,
  "/usuarios": GESTAO,
  "/perfis": ADMIN,
  "/permissoes": ADMIN,
  "/permissoes-rbac": ADMIN,
  "/grupos-permissoes": ADMIN,
  "/seguranca": ADMIN,
  "/auditoria": GESTAO,
  "/logs": ADMIN,
  "/logs-api": ADMIN,
  "/api": ADMIN,
  "/integracoes": ADMIN,
  "/backup": ADMIN,
  "/backups": ADMIN,
  "/status-sistema": ADMIN,
};

/** Retorna a regra mais específica (prefixo mais longo) para a rota. */
export function findRouteRule(pathname: string): Role[] | null {
  let match: { path: string; roles: Role[] } | null = null;
  for (const [path, roles] of Object.entries(ROUTE_ACCESS)) {
    if (pathname === path || pathname.startsWith(`${path}/`)) {
      if (!match || path.length > match.path.length) match = { path, roles };
    }
  }
  return match?.roles ?? null;
}

/** true quando o papel pode abrir a rota (rotas sem regra são livres). */
export function canAccessRoute(pathname: string, role: string | null): boolean {
  const rule = findRouteRule(pathname);
  if (!rule) return true;
  if (!role) return false;
  return rule.includes(role.toLowerCase() as Role);
}

/** Rotas visíveis para um papel, na ordem declarada. */
export function routesForRole(role: string | null): string[] {
  return Object.keys(ROUTE_ACCESS).filter((p) => canAccessRoute(p, role));
}
