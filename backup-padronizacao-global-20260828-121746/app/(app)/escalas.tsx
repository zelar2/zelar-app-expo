// Tela real de "Escalas e plantões" — CRUD completo (listar, criar, editar, excluir)
// sobre a tabela Supabase "escalas". Gerada a partir do schema real do
// projeto (supabase/migrations) — sem dados fictícios.
import { CrudScreen } from "@/components/CrudScreen";
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
    <CrudScreen
      title="Escalas e plantões"
      table="escalas"
      fields={FIELDS}
    />
  );
}
