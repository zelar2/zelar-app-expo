// Formulário de criação para "Avaliação de funcionários" — grava um registro real na
// tabela Supabase "avaliacoes_funcionarios" e volta para a listagem.
import { EntityFormScreen } from "@/components/EntityFormScreen";
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
    <EntityFormScreen
      title="Novo: Avaliação de funcionários"
      table="avaliacoes_funcionarios"
      backRoute="/avaliacoes-funcionarios"
      fields={FIELDS}
    />
  );
}
