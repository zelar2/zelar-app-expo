// Porta de src/routes/_authenticated/usuarios.$usuarioId.tsx (486 linhas na
// versão web, com edição completa). Aqui: ficha em modo leitura com dados
// reais; navegue para cá com router.push({ pathname: "/usuarios-detalhe", params: { id } }).
import { useLocalSearchParams } from "expo-router";
import { DetailScreen } from "@/components/DetailScreen";

export default function UsuarioDetalheScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  return <DetailScreen title="Detalhes do usuário" table="profiles" id={id} idColumn="id" />;
}
