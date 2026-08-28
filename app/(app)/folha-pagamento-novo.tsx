// Formulário de criação para "Folha de pagamento" — grava um registro real na
// tabela Supabase "folha_pagamento" e volta para a listagem.
import { EntityFormScreen } from "@/components/EntityFormScreen";
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
    <EntityFormScreen
      title="Novo: Folha de pagamento"
      table="folha_pagamento"
      backRoute="/folha-pagamento"
      fields={FIELDS}
    />
  );
}
