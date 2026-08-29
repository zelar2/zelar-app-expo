// Logs do sistema — leitura real da tabela "activity_logs".
import { CrudScreen } from "@/components/CrudScreen";
import type { FieldDef } from "@/components/CrudScreen";

const FIELDS: FieldDef[] = [
  { key: "action", label: "Ação", type: "text" },
  { key: "resource", label: "Recurso", type: "text" },
  { key: "resource_id", label: "ID do recurso", type: "text" },
  { key: "user_id", label: "Usuário", type: "text" },
  { key: "ip", label: "IP", type: "text" },
];

export default function Screen() {
  return <CrudScreen title="Logs do sistema" table="activity_logs" editable={false} fields={FIELDS} />;
}
