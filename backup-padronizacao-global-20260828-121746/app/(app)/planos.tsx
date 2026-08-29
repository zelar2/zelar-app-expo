// Tela real de "Planos" — CRUD completo (listar, criar, editar, excluir)
// sobre a tabela Supabase "plans". Gerada a partir do schema real do
// projeto (supabase/migrations) — sem dados fictícios.
import { CrudScreen } from "@/components/CrudScreen";
import type { FieldDef } from "@/components/CrudScreen";

const FIELDS: FieldDef[] = [
    { key: "name", label: "Nome", type: "text", required: true },
    { key: "slug", label: "Slug", type: "text", required: true },
    { key: "description", label: "Descrição", type: "textarea" },
    { key: "price_cents", label: "Preço (centavos)", type: "number" },
    { key: "interval", label: "Intervalo", type: "select", options: ["mensal", "anual"] },
    { key: "is_active", label: "Ativo", type: "boolean" },
];

export default function Screen() {
  return (
    <CrudScreen
      title="Planos"
      table="plans"
      fields={FIELDS}
    />
  );
}
