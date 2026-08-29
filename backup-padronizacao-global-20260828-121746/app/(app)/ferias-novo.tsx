// Formulário de criação para "Férias" — grava um registro real na
// tabela Supabase "ferias" e volta para a listagem.
import { EntityFormScreen } from "@/components/EntityFormScreen";
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
    <EntityFormScreen
      title="Novo: Férias"
      table="ferias"
      backRoute="/ferias"
      fields={FIELDS}
    />
  );
}
