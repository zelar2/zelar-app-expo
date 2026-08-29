// Adaptado do original: LinkProps do TanStack Router trocado por string simples,
// já que a navegação no Expo Router usa paths de string (ex: "/inicio").
import type { Role } from "@/permissions/permissions";
import {
  ADMIN,
  ALL_ROLES as ALL,
  CLIENTE_SIDE,
  CLINICO,
  GESTAO,
  STAFF,
} from "@/lib/route-access";

export interface ModuleLink {
  to: string;
  label: string;
  roles: Role[];
}

export interface ModuleGroup {
  title: string;
  items: ModuleLink[];
}

export const MODULE_GROUPS: ModuleGroup[] = [
  {
    title: "Principal",
    items: [
      { to: "/inicio", label: "Início", roles: ALL },
      { to: "/agenda", label: "Agenda", roles: ALL },
      { to: "/mapa", label: "Mapa de atendimentos", roles: ALL },
      { to: "/chamadas", label: "Chamadas (Uber da Saúde)", roles: ALL },
      { to: "/chat", label: "Mensagens", roles: ALL },
      { to: "/mensagens", label: "Central de mensagens", roles: STAFF },
      { to: "/teleconsulta", label: "Teleconsulta", roles: ALL },
      { to: "/sos", label: "SOS / Emergência", roles: ALL },
      { to: "/assistente-ia", label: "Assistente IA", roles: ALL },
      { to: "/chat-ia", label: "Chat com IA", roles: ALL },
    ],
  },
  {
    title: "Painéis",
    items: [
      {
        to: "/dashboard-cliente",
        label: "Painel do cliente",
        roles: [...CLIENTE_SIDE, "admin"],
      },
      {
        to: "/portal-cliente",
        label: "Portal do cliente",
        roles: [...CLIENTE_SIDE, "admin"],
      },
      { to: "/dashboard-profissional", label: "Painel do profissional", roles: CLINICO },
      { to: "/dashboard-executivo", label: "Painel executivo", roles: GESTAO },
      { to: "/admin", label: "Painel administrativo", roles: ADMIN },
      { to: "/analytics", label: "Analytics", roles: GESTAO },
      { to: "/relatorios", label: "Relatórios", roles: STAFF },
      { to: "/monitoramento", label: "Monitoramento", roles: ADMIN },
    ],
  },
  {
    title: "Assistência",
    items: [
      { to: "/clientes", label: "Clientes / Pacientes", roles: STAFF },
      { to: "/cliente-detalhes", label: "Ficha do cliente", roles: STAFF },
      { to: "/cliente-historico", label: "Histórico do cliente", roles: STAFF },
      { to: "/profissionais", label: "Profissionais", roles: ALL },
      { to: "/profissionais-admin", label: "Profissionais (gestão)", roles: GESTAO },
      { to: "/especialidades", label: "Especialidades", roles: STAFF },
      { to: "/categorias", label: "Categorias de serviço", roles: STAFF },
      { to: "/enfermagem", label: "Enfermagem / SAE", roles: STAFF },
      { to: "/prontuario", label: "Prontuário eletrônico", roles: ALL },
      { to: "/atendimentos", label: "Atendimentos", roles: STAFF },
      { to: "/meus-atendimentos", label: "Meus atendimentos", roles: ALL },
      { to: "/fila", label: "Fila de atendimento", roles: STAFF },
      { to: "/avaliacoes", label: "Avaliações", roles: ALL },
    ],
  },
  {
    title: "Documentos",
    items: [
      { to: "/documentos", label: "Documentos", roles: ALL },
      { to: "/meus-documentos", label: "Meus documentos", roles: ALL },
      { to: "/upload-documentos", label: "Enviar documentos", roles: ALL },
      { to: "/assinatura-documentos", label: "Assinatura de documentos", roles: STAFF },
      { to: "/aprovacoes", label: "Aprovações de cadastro", roles: GESTAO },
      { to: "/contratos", label: "Contratos", roles: STAFF },
      { to: "/meus-contratos", label: "Meus contratos", roles: ALL },
    ],
  },
  {
    title: "Financeiro",
    items: [
      { to: "/financeiro", label: "Financeiro", roles: STAFF },
      { to: "/pagamentos", label: "Pagamentos", roles: GESTAO },
      { to: "/meus-pagamentos", label: "Meus pagamentos", roles: ALL },
      { to: "/faturas", label: "Faturas", roles: STAFF },
      { to: "/comissoes", label: "Comissões", roles: STAFF },
      { to: "/planos", label: "Planos", roles: ALL },
      { to: "/assinaturas", label: "Assinaturas", roles: GESTAO },
      { to: "/cupons", label: "Cupons", roles: GESTAO },
      { to: "/convenios", label: "Convênios", roles: STAFF },
      { to: "/crm-clientes", label: "CRM de clientes", roles: GESTAO },
      { to: "/funil-vendas", label: "Funil de vendas", roles: GESTAO },
    ],
  },
  {
    title: "Recursos humanos",
    items: [
      { to: "/colaboradores", label: "Colaboradores", roles: GESTAO },
      { to: "/escalas", label: "Escalas e plantões", roles: STAFF },
      { to: "/banco-horas", label: "Banco de horas", roles: STAFF },
      { to: "/ferias", label: "Férias", roles: STAFF },
      { to: "/afastamentos", label: "Afastamentos", roles: STAFF },
      { to: "/folha-pagamento", label: "Folha de pagamento", roles: ADMIN },
      { to: "/avaliacoes-funcionarios", label: "Avaliação de funcionários", roles: GESTAO },
    ],
  },
  {
    title: "Notificações e suporte",
    items: [
      { to: "/notificacoes", label: "Notificações", roles: ALL },
      { to: "/central-notificacoes", label: "Central de notificações", roles: GESTAO },
      { to: "/notificacoes-tempo-real", label: "Notificações em tempo real", roles: GESTAO },
      { to: "/suporte", label: "Suporte", roles: ALL },
      { to: "/chamados", label: "Chamados de suporte", roles: ALL },
    ],
  },
  {
    title: "Conta e sistema",
    items: [
      { to: "/perfil", label: "Meu perfil", roles: ALL },
      { to: "/minha-conta", label: "Minha conta", roles: ALL },
      { to: "/configuracoes", label: "Configurações", roles: ALL },
      { to: "/usuarios", label: "Usuários", roles: GESTAO },
      { to: "/perfis", label: "Perfis de acesso", roles: ADMIN },
      { to: "/permissoes", label: "Permissões", roles: ADMIN },
      { to: "/permissoes-rbac", label: "Permissões RBAC", roles: ADMIN },
      { to: "/grupos-permissoes", label: "Grupos de permissões", roles: ADMIN },
      { to: "/seguranca", label: "Segurança", roles: ADMIN },
      { to: "/auditoria", label: "Auditoria", roles: GESTAO },
      { to: "/logs", label: "Logs do sistema", roles: ADMIN },
      { to: "/logs-api", label: "Logs de API", roles: ADMIN },
      { to: "/api", label: "API e chaves", roles: ADMIN },
      { to: "/integracoes", label: "Integrações", roles: ADMIN },
      { to: "/backups", label: "Backups", roles: ADMIN },
      { to: "/status-sistema", label: "Status do sistema", roles: ADMIN },
    ],
  },
];
