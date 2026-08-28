// Chamadas (Uber da Saúde) — CRUD real sobre service_calls: criar,
// editar status e excluir chamadas, além de abrir o detalhe completo.
import { CrudScreen } from "@/components/CrudScreen";
import type { FieldDef } from "@/components/CrudScreen";

const FIELDS: FieldDef[] = [
  { key: "patient_id", label: "ID do paciente", type: "text", required: true },
  { key: "requester_id", label: "Solicitante", autoUser: true },
  { key: "procedure_code", label: "Código do procedimento", type: "text", required: true },
  { key: "address", label: "Endereço", type: "text", required: true },
  { key: "price_cents", label: "Preço (centavos)", type: "number" },
  { key: "status", label: "Status", type: "select", options: ["buscando", "aceita", "a_caminho", "em_atendimento", "concluida", "cancelada"] },
  { key: "notes", label: "Observações", type: "textarea" },
];

export default function Screen() {
  return <CrudScreen title="Chamadas (Uber da Saúde)" table="service_calls" detailRoute="/chamada-detalhe" fields={FIELDS} />;
}
