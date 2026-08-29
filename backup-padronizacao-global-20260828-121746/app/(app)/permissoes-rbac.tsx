// Tela real de "Permissões RBAC" — CRUD completo (listar, criar, editar, excluir)
// sobre a tabela Supabase "permissions". Gerada a partir do schema real do
// projeto (supabase/migrations) — sem dados fictícios.
import { CrudScreen } from "@/components/CrudScreen";
import type { FieldDef } from "@/components/CrudScreen";

const FIELDS: FieldDef[] = [
    { key: "key", label: "Chave", type: "text", required: true },
    { key: "resource", label: "Recurso", type: "text", required: true },
    { key: "action", label: "Ação", type: "text", required: true },
    { key: "description", label: "Descrição", type: "textarea" },
];

export default function Screen() {
  return (
    <CrudScreen
      title="Permissões RBAC"
      table="permissions"
      fields={FIELDS}
    />
  );
}
