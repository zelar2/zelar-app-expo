// Tela real de "Funil de vendas" — CRUD completo (listar, criar, editar, excluir)
// sobre a tabela Supabase "crm_clientes". Gerada a partir do schema real do
// projeto (supabase/migrations) — sem dados fictícios.
import { CrudScreen } from "@/components/CrudScreen";
import type { FieldDef } from "@/components/CrudScreen";

const FIELDS: FieldDef[] = [
    { key: "full_name", label: "Nome completo", type: "text", required: true },
    { key: "stage", label: "Estágio", type: "select", options: ["novo", "contato", "proposta", "fechado", "perdido"], required: true },
    { key: "valor_estimado", label: "Valor estimado", type: "number" },
    { key: "responsavel", label: "Responsável", type: "text" },
];

export default function Screen() {
  return (
    <CrudScreen
      title="Funil de vendas"
      table="crm_clientes"
      fields={FIELDS}
    />
  );
}
