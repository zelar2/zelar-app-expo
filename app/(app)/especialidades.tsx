// Tela real de "Especialidades" — CRUD completo (listar, criar, editar, excluir)
// sobre a tabela Supabase "especialidades". Gerada a partir do schema real do
// projeto (supabase/migrations) — sem dados fictícios.
import { CrudScreen } from "@/components/CrudScreen";
import type { FieldDef } from "@/components/CrudScreen";

const FIELDS: FieldDef[] = [
    { key: "nome", label: "Nome", type: "text", required: true },
    { key: "slug", label: "Slug", type: "text", required: true },
    { key: "categoria", label: "Categoria", type: "select", options: ["enfermeiro", "tecnico_enfermagem", "medico", "psicologo", "fisioterapeuta", "fonoaudiologo", "nutricionista", "terapeuta_ocupacional", "cuidador", "auxiliar_enfermagem"], required: true },
    { key: "descricao", label: "Descrição", type: "textarea" },
    { key: "is_active", label: "Ativa", type: "boolean" },
];

export default function Screen() {
  return (
    <CrudScreen
      title="Especialidades"
      table="especialidades"
      fields={FIELDS}
    />
  );
}
