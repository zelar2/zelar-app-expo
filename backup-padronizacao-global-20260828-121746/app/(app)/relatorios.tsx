// Relatórios — CRUD real sobre a tabela "reports".
import { CrudScreen } from "@/components/CrudScreen";
import type { FieldDef } from "@/components/CrudScreen";

const FIELDS: FieldDef[] = [
  { key: "title", label: "Título", type: "text", required: true },
  { key: "kind", label: "Tipo", type: "text" },
  { key: "period_start", label: "Período - início", type: "date" },
  { key: "period_end", label: "Período - fim", type: "date" },
  { key: "status", label: "Status", type: "select", options: ["pendente", "processando", "concluido", "erro"] },
  { key: "owner_id", label: "Dono", autoUser: true },
];

export default function Screen() {
  return <CrudScreen title="Relatórios" table="reports" fields={FIELDS} />;
}
