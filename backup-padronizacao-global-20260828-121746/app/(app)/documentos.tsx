// Tela real de "Documentos" — CRUD completo (listar, criar, editar, excluir)
// sobre a tabela Supabase "profissional_documentos". Gerada a partir do schema real do
// projeto (supabase/migrations) — sem dados fictícios.
import { CrudScreen } from "@/components/CrudScreen";
import type { FieldDef } from "@/components/CrudScreen";

const FIELDS: FieldDef[] = [
    { key: "profissional_id", label: "ID do profissional", type: "text", required: true },
    { key: "tipo", label: "Tipo", type: "select", options: ["coren", "crm", "crp", "crefito", "crfa", "crn", "rg", "cpf", "diploma", "certificado", "comprovante_endereco", "outro"], required: true },
    { key: "numero", label: "Número", type: "text" },
    { key: "orgao_emissor", label: "Órgão emissor", type: "text" },
    { key: "validade", label: "Validade", type: "date" },
    { key: "status", label: "Status", type: "select", options: ["pendente", "aprovado", "recusado", "assinado", "rejeitado"] },
    { key: "observacoes", label: "Observações", type: "textarea" },
];

export default function Screen() {
  return (
    <CrudScreen
      title="Documentos"
      table="profissional_documentos"
      fields={FIELDS}
    />
  );
}
