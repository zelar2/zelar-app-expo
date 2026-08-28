// Tela real de "Pagamentos" — CRUD completo (listar, criar, editar, excluir)
// sobre a tabela Supabase "pagamentos". Gerada a partir do schema real do
// projeto (supabase/migrations) — sem dados fictícios.
import { CrudScreen } from "@/components/CrudScreen";
import type { FieldDef } from "@/components/CrudScreen";

const FIELDS: FieldDef[] = [
    { key: "cliente_id", label: "ID do cliente", type: "text", required: true },
    { key: "contrato_id", label: "ID do contrato", type: "text" },
    { key: "descricao", label: "Descrição", type: "text", required: true },
    { key: "valor", label: "Valor", type: "number", required: true },
    { key: "vencimento", label: "Vencimento", type: "date" },
    { key: "data_pagamento", label: "Data de pagamento", type: "date" },
    { key: "metodo", label: "Método", type: "select", options: ["pix", "cartao", "boleto", "dinheiro"] },
    { key: "status", label: "Status", type: "select", options: ["pendente", "pago", "atrasado", "cancelado"] },
];

export default function Screen() {
  return (
    <CrudScreen
      title="Pagamentos"
      table="pagamentos"
      fields={FIELDS}
    />
  );
}
