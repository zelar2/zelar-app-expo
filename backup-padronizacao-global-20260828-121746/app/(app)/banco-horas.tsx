// Tela real de "Banco de horas" — CRUD completo (listar, criar, editar, excluir)
// sobre a tabela Supabase "banco_horas". Gerada a partir do schema real do
// projeto (supabase/migrations) — sem dados fictícios.
import { CrudScreen } from "@/components/CrudScreen";
import type { FieldDef } from "@/components/CrudScreen";

const FIELDS: FieldDef[] = [
    { key: "colaborador_id", label: "ID do colaborador", type: "text", required: true },
    { key: "data", label: "Data", type: "date", required: true },
    { key: "tipo", label: "Tipo", type: "select", options: ["credito", "debito"] },
    { key: "horas", label: "Horas", type: "number", required: true },
    { key: "motivo", label: "Motivo", type: "textarea" },
    { key: "saldo_atual", label: "Saldo atual", type: "number" },
];

export default function Screen() {
  return (
    <CrudScreen
      title="Banco de horas"
      table="banco_horas"
      fields={FIELDS}
    />
  );
}
