// Prontuário eletrônico — CRUD real sobre health_records.
import { CrudScreen } from "@/components/CrudScreen";
import type { FieldDef } from "@/components/CrudScreen";

const FIELDS: FieldDef[] = [
  { key: "patient_id", label: "ID do paciente", type: "text", required: true },
  { key: "title", label: "Título", type: "text", required: true },
  { key: "category", label: "Categoria", type: "select", required: true, options: ["perfil_clinico", "medicamento", "vacina", "sinais_vitais", "exame", "evolucao"] },
  { key: "content", label: "Conteúdo", type: "textarea" },
  { key: "author_id", label: "Autor", autoUser: true },
];

export default function Screen() {
  return <CrudScreen title="Prontuário eletrônico" table="health_records" fields={FIELDS} />;
}
