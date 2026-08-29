// Tela real de "Assinatura de documentos" — CRUD completo (listar, criar, editar, excluir)
// sobre a tabela Supabase "profissional_documentos". Gerada a partir do schema real do
// projeto (supabase/migrations) — sem dados fictícios.
import { CrudScreen } from "@/components/CrudScreen";
import type { FieldDef } from "@/components/CrudScreen";

const FIELDS: FieldDef[] = [
    { key: "profissional_id", label: "ID do profissional", type: "text", required: true },
    { key: "tipo", label: "Tipo", type: "select", options: ["coren", "crm", "crp", "crefito", "crfa", "crn", "rg", "cpf", "diploma", "certificado", "comprovante_endereco", "outro"], required: true },
    { key: "status", label: "Status", type: "select", options: ["pendente", "aprovado", "recusado", "assinado", "rejeitado"] },
    { key: "motivo_recusa", label: "Motivo de recusa (se houver)", type: "textarea" },
];

export default function Screen() {
  return (
    <CrudScreen
      title="Assinatura de documentos"
      table="profissional_documentos"
      fields={FIELDS}
    />
  );
}
