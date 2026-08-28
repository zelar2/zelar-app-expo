// Tela real de "Atendimentos" — CRUD completo (listar, criar, editar, excluir)
// sobre a tabela Supabase "appointments". Gerada a partir do schema real do
// projeto (supabase/migrations) — sem dados fictícios.
import { CrudScreen } from "@/components/CrudScreen";
import type { FieldDef } from "@/components/CrudScreen";

const FIELDS: FieldDef[] = [
    { key: "title", label: "Título", type: "text", required: true },
    { key: "patient_id", label: "ID do paciente", type: "text", required: true },
    { key: "professional_id", label: "ID do profissional", type: "text" },
    { key: "type", label: "Tipo", type: "select", options: ["domiciliar", "teleconsulta", "presencial"] },
    { key: "scheduled_at", label: "Data/hora agendada", type: "date", required: true },
    { key: "duration_minutes", label: "Duração (min)", type: "number" },
    { key: "address", label: "Endereço", type: "text" },
    { key: "status", label: "Status", type: "select", options: ["agendado", "confirmado", "concluido", "cancelado"] },
    { key: "description", label: "Descrição", type: "textarea" },
];

export default function Screen() {
  return (
    <CrudScreen
      title="Atendimentos"
      table="appointments"
      fields={FIELDS}
    />
  );
}
