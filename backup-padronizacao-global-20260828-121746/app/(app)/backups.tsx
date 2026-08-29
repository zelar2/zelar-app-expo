// Backups — CRUD real sobre a tabela "backups".
import { CrudScreen } from "@/components/CrudScreen";
import type { FieldDef } from "@/components/CrudScreen";

const FIELDS: FieldDef[] = [
  { key: "label", label: "Rótulo", type: "text", required: true },
  { key: "kind", label: "Tipo", type: "select", options: ["completo", "incremental"] },
  { key: "status", label: "Status", type: "select", options: ["pendente", "em_andamento", "concluido", "erro"] },
  { key: "created_by", label: "Criado por", autoUser: true },
];

export default function Screen() {
  return <CrudScreen title="Backups" table="backups" fields={FIELDS} />;
}
