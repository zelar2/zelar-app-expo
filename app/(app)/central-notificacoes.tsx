// Tela real de "Central de notificações" — CRUD completo (listar, criar, editar, excluir)
// sobre a tabela Supabase "notifications". Gerada a partir do schema real do
// projeto (supabase/migrations) — sem dados fictícios.
import { CrudScreen } from "@/components/CrudScreen";
import type { FieldDef } from "@/components/CrudScreen";

const FIELDS: FieldDef[] = [
    { key: "user_id", label: "ID do usuário destinatário", type: "text", required: true },
    { key: "title", label: "Título", type: "text", required: true },
    { key: "message", label: "Mensagem", type: "textarea" },
    { key: "type", label: "Tipo", type: "select", options: ["info", "alerta", "sucesso", "erro"] },
    { key: "link", label: "Link (rota do app)", type: "text" },
];

export default function Screen() {
  return (
    <CrudScreen
      title="Central de notificações"
      table="notifications"
      fields={FIELDS}
    />
  );
}
