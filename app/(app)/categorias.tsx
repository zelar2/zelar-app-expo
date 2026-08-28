// Tela real de "Categorias de serviço" — CRUD completo (listar, criar, editar, excluir)
// sobre a tabela Supabase "procedures". Gerada a partir do schema real do
// projeto (supabase/migrations) — sem dados fictícios.
import { CrudScreen } from "@/components/CrudScreen";
import type { FieldDef } from "@/components/CrudScreen";

const FIELDS: FieldDef[] = [
    { key: "code", label: "Código", type: "text", required: true },
    { key: "name", label: "Nome", type: "text", required: true },
    { key: "group_label", label: "Grupo", type: "text", required: true },
    { key: "base_price_cents", label: "Preço base (centavos)", type: "number" },
    { key: "estimated_duration_minutes", label: "Duração estimada (min)", type: "number" },
    { key: "requires_prescription", label: "Requer prescrição", type: "boolean" },
    { key: "is_active", label: "Ativo", type: "boolean" },
    { key: "description", label: "Descrição", type: "textarea" },
];

export default function Screen() {
  return (
    <CrudScreen
      title="Categorias de serviço"
      table="procedures"
      fields={FIELDS}
    />
  );
}
