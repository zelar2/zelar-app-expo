// Avaliações — CRUD real sobre a tabela "avaliacoes" (nota + comentário
// de um cliente sobre um atendimento/chamada de um profissional).
import { CrudScreen } from "@/components/CrudScreen";
import type { FieldDef } from "@/components/CrudScreen";

const FIELDS: FieldDef[] = [
  { key: "cliente_id", label: "ID do cliente", type: "text", required: true },
  { key: "profissional_id", label: "ID do profissional", type: "text", required: true },
  { key: "appointment_id", label: "ID do atendimento", type: "text" },
  { key: "service_call_id", label: "ID da chamada", type: "text" },
  { key: "nota", label: "Nota (1-5)", type: "number", required: true },
  { key: "comentario", label: "Comentário", type: "textarea" },
];

export default function Screen() {
  return <CrudScreen title="Avaliações" table="avaliacoes" fields={FIELDS} />;
}
