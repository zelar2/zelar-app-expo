// Tela real de "Meus pagamentos" — CRUD completo (listar, criar, editar, excluir)
// sobre a tabela Supabase "pagamentos". Gerada a partir do schema real do
// projeto (supabase/migrations) — sem dados fictícios.
import { CrudScreen } from "@/components/CrudScreen";
import type { FieldDef } from "@/components/CrudScreen";

const FIELDS: FieldDef[] = [
    { key: "descricao", label: "Descrição", type: "text", required: true },
    { key: "valor", label: "Valor", type: "number", required: true },
    { key: "vencimento", label: "Vencimento", type: "date" },
    { key: "status", label: "Status", type: "select", options: ["pendente", "pago", "atrasado", "cancelado"] },
];

export default function Screen() {
  return (
    <CrudScreen
      title="Meus pagamentos"
      table="pagamentos"
      fields={FIELDS}
    />
  );
}
