// Usuários — CRUD sobre a tabela "profiles" (perfis de todos os usuários).
import { CrudScreen } from "@/components/CrudScreen";
import type { FieldDef } from "@/components/CrudScreen";

const FIELDS: FieldDef[] = [
  { key: "full_name", label: "Nome completo", type: "text", required: true },
  { key: "phone", label: "Telefone", type: "text" },
  { key: "city", label: "Cidade", type: "text" },
  { key: "state", label: "Estado", type: "text" },
  { key: "status", label: "Status", type: "select", options: ["ativo", "pendente", "suspenso"] },
  { key: "bio", label: "Bio", type: "textarea" },
];

export default function Screen() {
  return <CrudScreen title="Usuários" table="profiles" detailRoute="/usuarios-detalhe" fields={FIELDS} />;
}
