// Porta de src/routes/_authenticated/profissional.$profId.tsx (972 linhas na
// versão web). Ficha em modo leitura com dados reais.
import { useLocalSearchParams } from "expo-router";
import { DetailScreen } from "@/components/DetailScreen";

export default function ProfissionalPerfilScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  return <DetailScreen title="Perfil do profissional" table="profiles" id={id} idColumn="id" />;
}
