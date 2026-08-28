// Ficha do cliente (equivalente à rota cliente.$clienteId do projeto original).
// Corrige o mapeamento anterior, que apontava por engano para a tabela
// "contratos" em vez de "clientes".
import { useLocalSearchParams } from "expo-router";
import { DetailScreen } from "@/components/DetailScreen";

export default function ClienteDetalhesScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  return <DetailScreen title="Ficha do cliente" table="clientes" id={id} idColumn="id" />;
}
