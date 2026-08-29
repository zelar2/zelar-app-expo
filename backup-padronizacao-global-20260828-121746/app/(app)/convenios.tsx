// Tela real de "Convênios" — CRUD completo (listar, criar, editar, excluir)
// sobre a tabela Supabase "convenios". Gerada a partir do schema real do
// projeto (supabase/migrations) — sem dados fictícios.
import { CrudScreen } from "@/components/CrudScreen";
import type { FieldDef } from "@/components/CrudScreen";

const FIELDS: FieldDef[] = [
    { key: "nome", label: "Nome", type: "text", required: true },
    { key: "registro_ans", label: "Registro ANS", type: "text" },
    { key: "telefone", label: "Telefone", type: "text" },
    { key: "email", label: "E-mail", type: "text" },
    { key: "desconto_percentual", label: "Desconto (%)", type: "number" },
    { key: "is_active", label: "Ativo", type: "boolean" },
    { key: "observacoes", label: "Observações", type: "textarea" },
];

export default function Screen() {
  return (
    <CrudScreen
      title="Convênios"
      table="convenios"
      fields={FIELDS}
    />
  );
}
