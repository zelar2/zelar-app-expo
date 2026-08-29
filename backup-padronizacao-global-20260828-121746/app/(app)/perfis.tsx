// Perfis de acesso — atribuição de papéis (user_roles) a usuários.
import { CrudScreen } from "@/components/CrudScreen";
import type { FieldDef } from "@/components/CrudScreen";

const FIELDS: FieldDef[] = [
  { key: "user_id", label: "ID do usuário", type: "text", required: true },
  { key: "role", label: "Papel", type: "select", required: true, options: ["admin", "executivo", "profissional", "paciente", "cliente", "familiar"] },
];

export default function Screen() {
  return <CrudScreen title="Perfis de acesso" table="user_roles" fields={FIELDS} />;
}
