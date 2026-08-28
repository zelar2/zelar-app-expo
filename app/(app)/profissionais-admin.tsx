// Tela real de "Profissionais (gestão)" — CRUD completo sobre a tabela
// "profiles", com os campos específicos de cadastro profissional
// (registro no conselho, categoria, valor/hora, raio de atendimento,
// verificação). Rota já estava declarada em src/lib/route-access.ts
// ("/profissionais-admin": GESTAO) mas a tela nunca tinha sido criada —
// era uma rota fantasma. "/profissionais" continua sendo o diretório
// somente-leitura para todos os papéis; esta tela é a gestão (admin/
// executivo) do cadastro em si.
import { CrudScreen } from "@/components/CrudScreen";
import type { FieldDef } from "@/components/CrudScreen";

const FIELDS: FieldDef[] = [
  { key: "full_name", label: "Nome completo", type: "text", required: true },
  { key: "council_number", label: "Registro no conselho", type: "text" },
  {
    key: "category",
    label: "Categoria",
    type: "select",
    options: ["enfermeiro", "tecnico_enfermagem", "medico", "fisioterapeuta", "cuidador"],
  },
  { key: "phone", label: "Telefone", type: "text" },
  { key: "city", label: "Cidade", type: "text" },
  { key: "state", label: "Estado", type: "text" },
  { key: "preco_hora_cents", label: "Valor por hora (centavos)", type: "number" },
  { key: "raio_atendimento_km", label: "Raio de atendimento (km)", type: "number" },
  { key: "status", label: "Status", type: "select", options: ["ativo", "pendente", "suspenso"] },
  { key: "verificado", label: "Verificado", type: "boolean" },
  { key: "aceita_novos_pacientes", label: "Aceita novos pacientes", type: "boolean" },
  { key: "atende_teleconsulta", label: "Atende teleconsulta", type: "boolean" },
  { key: "bio", label: "Bio", type: "textarea" },
];

export default function Screen() {
  return (
    <CrudScreen
      title="Profissionais (gestão)"
      table="profiles"
      detailRoute="/profissional-perfil"
      fields={FIELDS}
    />
  );
}
