// Formulário de criação para "Banco de horas" — grava um registro real na
// tabela Supabase "banco_horas" e volta para a listagem.
import { EntityFormScreen } from "@/components/EntityFormScreen";
import type { FieldDef } from "@/components/CrudScreen";

const FIELDS: FieldDef[] = [
    { key: "colaborador_id", label: "ID do colaborador", type: "text", required: true },
    { key: "data", label: "Data", type: "date", required: true },
    { key: "tipo", label: "Tipo", type: "select", options: ["credito", "debito"] },
    { key: "horas", label: "Horas", type: "number", required: true },
    { key: "motivo", label: "Motivo", type: "textarea" },
    { key: "saldo_atual", label: "Saldo atual", type: "number" },
];

export default function Screen() {
  return (
    <EntityFormScreen
      title="Novo: Banco de horas"
      table="banco_horas"
      backRoute="/banco-horas"
      fields={FIELDS}
    />
  );
}
