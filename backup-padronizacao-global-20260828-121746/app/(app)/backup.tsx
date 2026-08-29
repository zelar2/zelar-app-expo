// Disparar backup — formulário rápido para criar um novo registro de
// backup (mesma tabela usada pela tela "Backups").
import { EntityFormScreen } from "@/components/EntityFormScreen";
import type { FieldDef } from "@/components/CrudScreen";

const FIELDS: FieldDef[] = [
  { key: "label", label: "Rótulo", type: "text" as const, required: true },
  { key: "kind", label: "Tipo", type: "select" as const, options: ["completo", "incremental"] },
  { key: "created_by", label: "Criado por", autoUser: true },
];

export default function Screen() {
  return <EntityFormScreen title="Novo backup" table="backups" backRoute="/backups" fields={FIELDS} />;
}
