// API e chaves — gerenciamento real de chaves de API/serviços, também
// baseado na tabela "settings".
import { CrudScreen } from "@/components/CrudScreen";
import type { FieldDef } from "@/components/CrudScreen";

const FIELDS: FieldDef[] = [
  { key: "key", label: "Nome da chave", type: "text", required: true },
  { key: "value", label: "Valor", type: "textarea" },
  { key: "scope", label: "Escopo", type: "text" },
  { key: "description", label: "Descrição", type: "textarea" },
];

export default function Screen() {
  return <CrudScreen title="API e chaves" table="settings" fields={FIELDS} />;
}
