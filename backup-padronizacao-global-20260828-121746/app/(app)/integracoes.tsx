// Integrações — chaves/configurações de serviços externos (mapas, IA,
// pagamentos), armazenadas na tabela real "settings" (scope="integracoes").
import { CrudScreen } from "@/components/CrudScreen";
import type { FieldDef } from "@/components/CrudScreen";

const FIELDS: FieldDef[] = [
  { key: "key", label: "Chave (ex: openai_api_key)", type: "text", required: true },
  { key: "value", label: "Valor", type: "textarea" },
  { key: "scope", label: "Escopo", type: "text" },
  { key: "description", label: "Descrição", type: "textarea" },
];

export default function Screen() {
  return <CrudScreen title="Integrações" table="settings" fields={FIELDS} />;
}
