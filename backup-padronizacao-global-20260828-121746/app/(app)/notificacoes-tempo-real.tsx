// Preferências de notificação em tempo real do usuário — CRUD real sobre
// notification_settings (um registro por tipo de evento).
import { CrudScreen } from "@/components/CrudScreen";
import type { FieldDef } from "@/components/CrudScreen";

const FIELDS: FieldDef[] = [
  { key: "user_id", label: "ID do usuário", type: "text", required: true },
  { key: "event_type", label: "Tipo de evento", type: "text", required: true },
  { key: "push_enabled", label: "Push", type: "boolean" },
  { key: "email_enabled", label: "E-mail", type: "boolean" },
  { key: "in_app_enabled", label: "No app", type: "boolean" },
];

export default function Screen() {
  return <CrudScreen title="Notificações em tempo real" table="notification_settings" fields={FIELDS} />;
}
