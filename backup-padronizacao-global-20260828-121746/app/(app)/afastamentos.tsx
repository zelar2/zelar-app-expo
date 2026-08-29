// Tela real de "Afastamentos" — CRUD completo (listar, criar, editar, excluir)
// sobre a tabela Supabase "afastamentos". Gerada a partir do schema real do
// projeto (supabase/migrations) — sem dados fictícios.
import { CrudScreen } from "@/components/CrudScreen";
import type { FieldDef } from "@/components/CrudScreen";

const FIELDS: FieldDef[] = [
    { key: "colaborador_id", label: "ID do colaborador", type: "text", required: true },
    { key: "tipo", label: "Tipo", type: "select", options: ["atestado", "licenca", "falta", "outro"] },
    { key: "cid", label: "CID", type: "text" },
    { key: "data_inicio", label: "Data de início", type: "date", required: true },
    { key: "data_fim", label: "Data de fim", type: "date", required: true },
    { key: "motivo", label: "Motivo", type: "textarea" },
    { key: "status", label: "Status", type: "select", options: ["pendente", "aprovado", "recusado"] },
];

export default function Screen() {
  return (
    <CrudScreen
      title="Afastamentos"
      table="afastamentos"
      fields={FIELDS}
    />
  );
}
