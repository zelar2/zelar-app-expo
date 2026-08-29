// Central de mensagens (equipe) — CRUD real sobre "messages".
import { CrudScreen } from "@/components/CrudScreen";
import type { FieldDef } from "@/components/CrudScreen";

const FIELDS: FieldDef[] = [
  { key: "conversation_id", label: "ID da conversa", type: "text", required: true },
  { key: "sender_id", label: "Remetente", autoUser: true },
  { key: "content", label: "Mensagem", type: "textarea", required: true },
];

export default function Screen() {
  return <CrudScreen title="Central de mensagens" table="messages" fields={FIELDS} />;
}
