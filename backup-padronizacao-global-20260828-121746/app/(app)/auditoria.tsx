// Auditoria — lista real e somente-leitura da tabela "audit_logs"
// (trilha de auditoria de alterações no sistema). Corrige o mapeamento
// anterior, que apontava por engano para "notifications".
import { CrudScreen } from "@/components/CrudScreen";
import type { FieldDef } from "@/components/CrudScreen";

const FIELDS: FieldDef[] = [
  { key: "table_name", label: "Tabela", type: "text" },
  { key: "operation", label: "Operação", type: "text" },
  { key: "record_id", label: "ID do registro", type: "text" },
  { key: "actor_id", label: "Autor", type: "text" },
];

export default function Screen() {
  return <CrudScreen title="Auditoria" table="audit_logs" editable={false} fields={FIELDS} />;
}
