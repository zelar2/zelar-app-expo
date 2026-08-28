// Tela real de "Meus contratos" — CRUD completo (listar, criar, editar, excluir)
// sobre a tabela Supabase "contratos". Gerada a partir do schema real do
// projeto (supabase/migrations) — sem dados fictícios.
import { CrudScreen } from "@/components/CrudScreen";
import type { FieldDef } from "@/components/CrudScreen";

const FIELDS: FieldDef[] = [
    { key: "title", label: "Título", type: "text", required: true },
    { key: "status", label: "Status", type: "select", options: ["ativo", "encerrado", "cancelado"] },
    { key: "data_inicio", label: "Data de início", type: "date" },
    { key: "data_fim", label: "Data de fim", type: "date" },
];

export default function Screen() {
  return (
    <CrudScreen
      title="Meus contratos"
      table="contratos"
      fields={FIELDS}
    />
  );
}
