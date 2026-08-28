// Rota "profissionais" — diretório de profissionais (lista real da tabela
// "profiles", com busca e abertura do perfil completo). Mantida como
// navegação/consulta; edição de cadastro é feita em "Usuários" (admin).
import { GenericScreen } from "@/components/GenericScreen";

export default function Screen() {
  return <GenericScreen title="Profissionais" table="profiles" detailRoute="/profissional-perfil" />;
}
