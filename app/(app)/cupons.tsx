// Tela real de "Cupons" — CRUD completo (listar, criar, editar, excluir)
// sobre a tabela Supabase "cupons". Gerada a partir do schema real do
// projeto (supabase/migrations) — sem dados fictícios.
import { CrudScreen } from "@/components/CrudScreen";
import type { FieldDef } from "@/components/CrudScreen";

const FIELDS: FieldDef[] = [
    { key: "codigo", label: "Código", type: "text", required: true },
    { key: "descricao", label: "Descrição", type: "text" },
    { key: "tipo_desconto", label: "Tipo de desconto", type: "select", options: ["percentual", "valor_fixo"] },
    { key: "valor_desconto", label: "Valor do desconto", type: "number" },
    { key: "valido_de", label: "Válido de", type: "date" },
    { key: "valido_ate", label: "Válido até", type: "date" },
    { key: "limite_uso", label: "Limite de uso", type: "number" },
    { key: "is_active", label: "Ativo", type: "boolean" },
];

export default function Screen() {
  return (
    <CrudScreen
      title="Cupons"
      table="cupons"
      fields={FIELDS}
    />
  );
}
