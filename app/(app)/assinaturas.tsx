// Tela real de "Assinaturas" — CRUD completo (listar, criar, editar, excluir)
// sobre a tabela Supabase "subscriptions". Gerada a partir do schema real do
// projeto (supabase/migrations) — sem dados fictícios.
import { CrudScreen } from "@/components/CrudScreen";
import type { FieldDef } from "@/components/CrudScreen";

const FIELDS: FieldDef[] = [
    { key: "user_id", label: "ID do usuário", type: "text", required: true },
    { key: "plan_id", label: "ID do plano", type: "text", required: true },
    { key: "status", label: "Status", type: "select", options: ["ativa", "cancelada", "pendente"] },
    { key: "started_at", label: "Início", type: "date" },
    { key: "current_period_end", label: "Fim do período atual", type: "date" },
];

export default function Screen() {
  return (
    <CrudScreen
      title="Assinaturas"
      table="subscriptions"
      fields={FIELDS}
    />
  );
}
