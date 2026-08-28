// Porta de src/routes/_authenticated/cliente.$clienteId.tsx (1063 linhas na
// versão web). Aqui: ficha em modo leitura com dados reais; navegue com
// router.push({ pathname: "/cliente-perfil", params: { id } }).
import { useLocalSearchParams } from "expo-router";
import { DetailScreen } from "@/components/DetailScreen";

export default function ClientePerfilScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  return <DetailScreen title="Ficha do cliente" table="clientes" id={id} idColumn="id" />;
}
