// Tela real de "Permissões" — CRUD completo (listar, criar, editar, excluir)
// sobre a tabela Supabase "permissions". Gerada a partir do schema real do
// projeto (supabase/migrations) — sem dados fictícios.
import { CrudScreen } from "@/components/CrudScreen";
import type { FieldDef } from "@/components/CrudScreen";

const FIELDS: FieldDef[] = [
    { key: "key", label: "Chave", type: "text", required: true },
    { key: "resource", label: "Recurso", type: "text", required: true },
    { key: "action", label: "Ação", type: "text", required: true },
    { key: "description", label: "Descrição", type: "textarea" },
    { key: "group_id", label: "ID do grupo", type: "text" },
];

export default function Screen() {
  return (
    <CrudScreen
      title="Permissões"
      table="permissions"
      fields={FIELDS}
    />
  );
}
