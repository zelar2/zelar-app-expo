// Tela real de "Clientes / Pacientes" — CRUD completo sobre a tabela
// "clientes" (cadastro clínico completo, igual ao formulário web).
import { CrudScreen } from "@/components/CrudScreen";
import type { FieldDef } from "@/components/CrudScreen";

const FIELDS: FieldDef[] = [
  { key: "full_name", label: "Nome completo", type: "text", required: true },
  { key: "social_name", label: "Nome social", type: "text" },
  { key: "email", label: "E-mail", type: "text" },
  { key: "phone", label: "Telefone", type: "text" },
  { key: "birth_date", label: "Data de nascimento", type: "date" },
  { key: "sexo", label: "Sexo", type: "select", options: ["feminino", "masculino", "outro", "nao_informado"] },
  { key: "convenio", label: "Convênio", type: "text" },
  { key: "convenio_numero", label: "Número do convênio", type: "text" },
  { key: "cid", label: "CID", type: "text" },
  { key: "diagnostico", label: "Diagnóstico", type: "textarea" },
  { key: "alergias", label: "Alergias", type: "textarea" },
  { key: "medicamentos_uso", label: "Medicamentos em uso", type: "textarea" },
  { key: "mobilidade", label: "Mobilidade", type: "text" },
  { key: "emergencia_nome", label: "Contato de emergência (nome)", type: "text" },
  { key: "emergencia_telefone", label: "Contato de emergência (telefone)", type: "text" },
  { key: "status", label: "Status", type: "select", options: ["ativo", "inativo", "em_avaliacao", "alta"] },
  { key: "observacoes", label: "Observações", type: "textarea" },
  { key: "created_by", label: "Criado por", autoUser: true },
];

export default function Screen() {
  return <CrudScreen title="Clientes / Pacientes" table="clientes" detailRoute="/cliente-perfil" fields={FIELDS} />;
}
