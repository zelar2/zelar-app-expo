// Porta de src/routes/_authenticated/chamadas.$callId.tsx.
import { useLocalSearchParams } from "expo-router";
import { DetailScreen } from "@/components/DetailScreen";

export default function ChamadaDetalheScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  return <DetailScreen title="Detalhes da chamada" table="service_calls" id={id} idColumn="id" />;
}
