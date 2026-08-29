// Formulário de criação para "Escalas e plantões" — grava um registro real na
// tabela Supabase "escalas" e volta para a listagem.
import { EntityFormScreen } from "@/components/EntityFormScreen";
import type { FieldDef } from "@/components/CrudScreen";

const FIELDS: FieldDef[] = [
    { key: "colaborador_id", label: "ID do colaborador", type: "text", required: true },
    { key: "dia_semana", label: "Dia da semana (0=domingo)", type: "number", required: true },
    { key: "hora_inicio", label: "Hora início (HH:MM)", type: "text", required: true },
    { key: "hora_fim", label: "Hora fim (HH:MM)", type: "text", required: true },
    { key: "tipo", label: "Tipo", type: "select", options: ["manha", "tarde", "noite", "plantao"] },
];

export default function Screen() {
  return (
    <EntityFormScreen
      title="Novo: Escalas e plantões"
      table="escalas"
      backRoute="/escalas"
      fields={FIELDS}
    />
  );
}
