// Tela real de "Comissões" — CRUD completo (listar, criar, editar, excluir)
// sobre a tabela Supabase "comissoes". Gerada a partir do schema real do
// projeto (supabase/migrations) — sem dados fictícios.
import { CrudScreen } from "@/components/CrudScreen";
import type { FieldDef } from "@/components/CrudScreen";

const FIELDS: FieldDef[] = [
    { key: "profissional_id", label: "ID do profissional", type: "text", required: true },
    { key: "valor_base_cents", label: "Valor base (centavos)", type: "number" },
    { key: "percentual", label: "Percentual (%)", type: "number" },
    { key: "valor_comissao_cents", label: "Valor da comissão (centavos)", type: "number" },
    { key: "status", label: "Status", type: "select", options: ["pendente", "aprovada", "paga", "cancelada"] },
];

export default function Screen() {
  return (
    <CrudScreen
      title="Comissões"
      table="comissoes"
      fields={FIELDS}
    />
  );
}
