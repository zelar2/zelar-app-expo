// Tela real de "Férias" — CRUD completo (listar, criar, editar, excluir)
// sobre a tabela Supabase "ferias". Gerada a partir do schema real do
// projeto (supabase/migrations) — sem dados fictícios.
import { CrudScreen } from "@/components/CrudScreen";
import type { FieldDef } from "@/components/CrudScreen";

const FIELDS: FieldDef[] = [
    { key: "colaborador_id", label: "ID do colaborador", type: "text", required: true },
    { key: "data_inicio", label: "Data de início", type: "date", required: true },
    { key: "data_fim", label: "Data de fim", type: "date", required: true },
    { key: "dias", label: "Dias", type: "number" },
    { key: "status", label: "Status", type: "select", options: ["solicitada", "aprovada", "recusada", "concluida"] },
    { key: "observacoes", label: "Observações", type: "textarea" },
];

export default function Screen() {
  return (
    <CrudScreen
      title="Férias"
      table="ferias"
      fields={FIELDS}
    />
  );
}
