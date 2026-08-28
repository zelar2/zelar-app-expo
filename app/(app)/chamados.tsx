// Tela real de "Chamados de suporte" — CRUD completo (listar, criar, editar, excluir)
// sobre a tabela Supabase "tickets". Gerada a partir do schema real do
// projeto (supabase/migrations) — sem dados fictícios.
import { CrudScreen } from "@/components/CrudScreen";
import type { FieldDef } from "@/components/CrudScreen";

const FIELDS: FieldDef[] = [
    { key: "subject", label: "Assunto", type: "text", required: true },
    { key: "description", label: "Descrição", type: "textarea" },
    { key: "category", label: "Categoria", type: "select", options: ["tecnico", "financeiro", "clinico", "outro"] },
    { key: "priority", label: "Prioridade", type: "select", options: ["baixa", "media", "alta", "urgente"] },
    { key: "status", label: "Status", type: "select", options: ["aberto", "em_andamento", "resolvido", "fechado"] },
];

export default function Screen() {
  return (
    <CrudScreen
      title="Chamados de suporte"
      table="tickets"
      fields={FIELDS}
    />
  );
}
