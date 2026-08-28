// Tela real de "CRM de clientes" — CRUD completo (listar, criar, editar, excluir)
// sobre a tabela Supabase "crm_clientes". Gerada a partir do schema real do
// projeto (supabase/migrations) — sem dados fictícios.
import { CrudScreen } from "@/components/CrudScreen";
import type { FieldDef } from "@/components/CrudScreen";

const FIELDS: FieldDef[] = [
    { key: "full_name", label: "Nome completo", type: "text", required: true },
    { key: "email", label: "E-mail", type: "text" },
    { key: "phone", label: "Telefone", type: "text" },
    { key: "cidade", label: "Cidade", type: "text" },
    { key: "origem", label: "Origem", type: "text" },
    { key: "stage", label: "Estágio", type: "select", options: ["novo", "contato", "proposta", "fechado", "perdido"] },
    { key: "valor_estimado", label: "Valor estimado", type: "number" },
    { key: "responsavel", label: "Responsável", type: "text" },
    { key: "notas", label: "Notas", type: "textarea" },
];

export default function Screen() {
  return (
    <CrudScreen
      title="CRM de clientes"
      table="crm_clientes"
      fields={FIELDS}
    />
  );
}
