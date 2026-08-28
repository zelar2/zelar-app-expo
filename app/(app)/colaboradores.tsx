// Tela real de "Colaboradores" — CRUD completo (listar, criar, editar, excluir)
// sobre a tabela Supabase "colaboradores". Gerada a partir do schema real do
// projeto (supabase/migrations) — sem dados fictícios.
import { CrudScreen } from "@/components/CrudScreen";
import type { FieldDef } from "@/components/CrudScreen";

const FIELDS: FieldDef[] = [
    { key: "full_name", label: "Nome completo", type: "text", required: true },
    { key: "email", label: "E-mail", type: "text" },
    { key: "phone", label: "Telefone", type: "text" },
    { key: "cargo", label: "Cargo", type: "text" },
    { key: "departamento", label: "Departamento", type: "text" },
    { key: "carga_horaria", label: "Carga horária", type: "text" },
    { key: "data_admissao", label: "Data de admissão", type: "date" },
    { key: "salario", label: "Salário", type: "number" },
    { key: "status", label: "Status", type: "select", options: ["ativo", "ferias", "afastado", "demissional", "demissionado"] },
    { key: "observacoes", label: "Observações", type: "textarea" },
];

export default function Screen() {
  return (
    <CrudScreen
      title="Colaboradores"
      table="colaboradores"
      fields={FIELDS}
    />
  );
}
