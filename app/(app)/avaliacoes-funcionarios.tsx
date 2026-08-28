// Tela real de "Avaliação de funcionários" — CRUD completo (listar, criar, editar, excluir)
// sobre a tabela Supabase "avaliacoes_funcionarios". Gerada a partir do schema real do
// projeto (supabase/migrations) — sem dados fictícios.
import { CrudScreen } from "@/components/CrudScreen";
import type { FieldDef } from "@/components/CrudScreen";

const FIELDS: FieldDef[] = [
    { key: "colaborador_id", label: "ID do colaborador", type: "text", required: true },
    { key: "avaliador_id", label: "Avaliador", autoUser: true },
    { key: "periodo", label: "Período", type: "text", required: true },
    { key: "nota", label: "Nota (1-5)", type: "number", required: true },
    { key: "pontos_fortes", label: "Pontos fortes", type: "textarea" },
    { key: "pontos_melhoria", label: "Pontos de melhoria", type: "textarea" },
    { key: "comentarios", label: "Comentários", type: "textarea" },
];

export default function Screen() {
  return (
    <CrudScreen
      title="Avaliação de funcionários"
      table="avaliacoes_funcionarios"
      fields={FIELDS}
    />
  );
}
