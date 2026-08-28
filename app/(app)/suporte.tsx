// Suporte — abrir e acompanhar chamados (CRUD real sobre "tickets").
import { CrudScreen } from "@/components/CrudScreen";
import type { FieldDef } from "@/components/CrudScreen";

const FIELDS: FieldDef[] = [
  { key: "subject", label: "Assunto", type: "text", required: true },
  { key: "description", label: "Descrição", type: "textarea" },
  { key: "category", label: "Categoria", type: "select", options: ["tecnico", "financeiro", "clinico", "outro"] },
  { key: "priority", label: "Prioridade", type: "select", options: ["baixa", "media", "alta", "urgente"] },
  { key: "requester_id", label: "Solicitante", autoUser: true },
];

export default function Screen() {
  return <CrudScreen title="Suporte" table="tickets" fields={FIELDS} />;
}
