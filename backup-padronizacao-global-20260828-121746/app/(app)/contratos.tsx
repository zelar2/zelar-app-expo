// Tela real de "Contratos" — CRUD completo (listar, criar, editar, excluir)
// sobre a tabela Supabase "contratos". Gerada a partir do schema real do
// projeto (supabase/migrations) — sem dados fictícios.
import { CrudScreen } from "@/components/CrudScreen";
import type { FieldDef } from "@/components/CrudScreen";

const FIELDS: FieldDef[] = [
    { key: "title", label: "Título", type: "text", required: true },
    { key: "type", label: "Tipo", type: "select", options: ["prestacao_servico", "parceria", "outro"] },
    { key: "cliente_id", label: "ID do cliente", type: "text" },
    { key: "profissional_id", label: "ID do profissional", type: "text" },
    { key: "valor", label: "Valor", type: "number" },
    { key: "data_inicio", label: "Data de início", type: "date" },
    { key: "data_fim", label: "Data de fim", type: "date" },
    { key: "status", label: "Status", type: "select", options: ["ativo", "encerrado", "cancelado"] },
    { key: "clausulas", label: "Cláusulas", type: "textarea" },
    { key: "observacoes", label: "Observações", type: "textarea" },
];

export default function Screen() {
  return (
    <CrudScreen
      title="Contratos"
      table="contratos"
      fields={FIELDS}
    />
  );
}
