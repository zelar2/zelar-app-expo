// Enfermagem / SAE — CRUD real sobre sae_records (Sistematização da
// Assistência de Enfermagem).
import { CrudScreen } from "@/components/CrudScreen";
import type { FieldDef } from "@/components/CrudScreen";

const FIELDS: FieldDef[] = [
  { key: "title", label: "Título", type: "text", required: true },
  { key: "patient_id", label: "ID do paciente", type: "text", required: true },
  { key: "professional_id", label: "Profissional", autoUser: true },
  { key: "status", label: "Status", type: "select", options: ["aberto", "em_andamento", "concluido", "cancelado"] },
  { key: "avaliacao", label: "Avaliação", type: "textarea" },
];

export default function Screen() {
  return <CrudScreen title="Enfermagem / SAE" table="sae_records" fields={FIELDS} />;
}
