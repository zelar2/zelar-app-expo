// Tela real de "Grupos de permissões" — CRUD completo (listar, criar, editar, excluir)
// sobre a tabela Supabase "permission_groups". Gerada a partir do schema real do
// projeto (supabase/migrations) — sem dados fictícios.
import { CrudScreen } from "@/components/CrudScreen";
import type { FieldDef } from "@/components/CrudScreen";

const FIELDS: FieldDef[] = [
    { key: "name", label: "Nome", type: "text", required: true },
    { key: "description", label: "Descrição", type: "textarea" },
];

export default function Screen() {
  return (
    <CrudScreen
      title="Grupos de permissões"
      table="permission_groups"
      fields={FIELDS}
    />
  );
}
