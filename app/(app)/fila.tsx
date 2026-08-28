// Fila de atendimento — chamadas em busca de profissional (service_calls
// com status "buscando"), com CRUD real.
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
  return <CrudScreen title="Fila de atendimento" table="service_calls" fields={FIELDS} />;
}
