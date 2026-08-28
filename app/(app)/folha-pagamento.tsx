// Tela real de "Folha de pagamento" — CRUD completo (listar, criar, editar, excluir)
// sobre a tabela Supabase "folha_pagamento". Gerada a partir do schema real do
// projeto (supabase/migrations) — sem dados fictícios.
import { CrudScreen } from "@/components/CrudScreen";
import type { FieldDef } from "@/components/CrudScreen";

const FIELDS: FieldDef[] = [
    { key: "colaborador_id", label: "ID do colaborador", type: "text", required: true },
    { key: "mes_referencia", label: "Mês de referência (AAAA-MM)", type: "text", required: true },
    { key: "salario_bruto", label: "Salário bruto", type: "number" },
    { key: "salario_liquido", label: "Salário líquido", type: "number" },
    { key: "descontos", label: "Descontos", type: "number" },
    { key: "status", label: "Status", type: "select", options: ["pendente", "pago"] },
    { key: "data_pagamento", label: "Data de pagamento", type: "date" },
];

export default function Screen() {
  return (
    <CrudScreen
      title="Folha de pagamento"
      table="folha_pagamento"
      fields={FIELDS}
    />
  );
}
