// Tela real de "Meus atendimentos" — CRUD completo (listar, criar, editar, excluir)
// sobre a tabela Supabase "appointments". Gerada a partir do schema real do
// projeto (supabase/migrations) — sem dados fictícios.
import { CrudScreen } from "@/components/CrudScreen";
import type { FieldDef } from "@/components/CrudScreen";

const FIELDS: FieldDef[] = [
    { key: "title", label: "Título", type: "text", required: true },
    { key: "scheduled_at", label: "Data/hora agendada", type: "date", required: true },
    { key: "type", label: "Tipo", type: "select", options: ["domiciliar", "teleconsulta", "presencial"] },
    { key: "status", label: "Status", type: "select", options: ["agendado", "confirmado", "concluido", "cancelado"] },
];

export default function Screen() {
  return (
    <CrudScreen
      title="Meus atendimentos"
      table="appointments"
      fields={FIELDS}
    />
  );
}
