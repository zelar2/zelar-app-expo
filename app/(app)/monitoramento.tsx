// Monitoramento — contagens em tempo real de chamadas/atendimentos por
// status operacional.
import { StatsDashboard } from "@/components/StatsDashboard";

const METRICS = [
  { label: "Chamadas buscando", table: "service_calls", filter: { column: "status", value: "buscando" } },
  { label: "Chamadas em atendimento", table: "service_calls", filter: { column: "status", value: "em_atendimento" } },
  { label: "Atendimentos agendados", table: "appointments", filter: { column: "status", value: "agendado" } },
  { label: "Chamados de suporte abertos", table: "tickets", filter: { column: "status", value: "aberto" } },
  { label: "Documentos pendentes", table: "profissional_documentos", filter: { column: "status", value: "pendente" } },
];

export default function Screen() {
  return <StatsDashboard title="Monitoramento" subtitle="Operação em tempo real" metrics={METRICS} />;
}
