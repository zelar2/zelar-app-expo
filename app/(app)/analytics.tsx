// Analytics — contagens reais agregadas de várias tabelas do sistema.
import { StatsDashboard } from "@/components/StatsDashboard";

const METRICS = [
  { label: "Clientes", table: "clientes" },
  { label: "Profissionais", table: "profiles" },
  { label: "Atendimentos", table: "appointments" },
  { label: "Chamadas", table: "service_calls" },
  { label: "Contratos ativos", table: "contratos", filter: { column: "status", value: "ativo" } },
  { label: "Pagamentos pendentes", table: "pagamentos", filter: { column: "status", value: "pendente" } },
];

export default function Screen() {
  return <StatsDashboard title="Analytics" subtitle="Visão geral do sistema" metrics={METRICS} />;
}
