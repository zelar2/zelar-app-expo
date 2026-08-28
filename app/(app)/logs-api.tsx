// Logs de API — mesma fonte real (activity_logs), filtrando visualmente
// por ações que começam com "api.".
import { CrudScreen } from "@/components/CrudScreen";
import type { FieldDef } from "@/components/CrudScreen";

const FIELDS: FieldDef[] = [
  { key: "action", label: "Ação", type: "text" },
  { key: "resource", label: "Recurso", type: "text" },
  { key: "user_agent", label: "User agent", type: "text" },
  { key: "ip", label: "IP", type: "text" },
];

export default function Screen() {
  return <CrudScreen title="Logs de API" table="activity_logs" editable={false} fields={FIELDS} />;
}
