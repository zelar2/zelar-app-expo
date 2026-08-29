// Portal do cliente — atalhos + lista real dos contratos do usuário
// logado.
import { ScrollView, StyleSheet, Text } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/auth-context";
import { colors } from "@/theme/colors";
import { Badge, Card, LoadingState, toneForStatus } from "@/components/ui/Kit";

const SHORTCUTS: { to: string; label: string }[] = [
  { to: "/meus-contratos", label: "Meus contratos" },
  { to: "/meus-pagamentos", label: "Meus pagamentos" },
  { to: "/meus-documentos", label: "Meus documentos" },
  { to: "/meus-atendimentos", label: "Meus atendimentos" },
];

export default function PortalClienteScreen() {
  const { user } = useAuth();
  const router = useRouter();

  const { data, isLoading } = useQuery({
    queryKey: ["portal-cliente-contratos", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("contratos").select("*").eq("cliente_id", user!.id).limit(5);
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!user,
  });

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
      <Text style={styles.title}>Portal do cliente</Text>

      {SHORTCUTS.map((s) => (
        <Card key={s.to} style={{ marginTop: 10 }} onPress={() => router.push(s.to as never)}>
          <Text style={styles.shortcutLabel}>{s.label}</Text>
        </Card>
      ))}

      <Text style={styles.sectionTitle}>Meus contratos</Text>
      {isLoading && <LoadingState />}
      {!isLoading && (data ?? []).length === 0 && <Text style={styles.muted}>Nenhum contrato encontrado.</Text>}
      {(data ?? []).map((c) => (
        <Card key={c.id} style={{ marginTop: 10 }}>
          <Text style={styles.itemTitle}>{c.title}</Text>
          <Badge label={c.status} tone={toneForStatus(c.status)} />
        </Card>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.card },
  title: { fontSize: 20, fontWeight: "800", color: colors.text, marginBottom: 4 },
  shortcutLabel: { fontSize: 14.5, fontWeight: "700", color: colors.text },
  sectionTitle: { fontSize: 13, fontWeight: "800", color: colors.textMuted, textTransform: "uppercase", marginTop: 22, marginBottom: 6 },
  muted: { color: colors.textMuted, fontSize: 13.5 },
  itemTitle: { fontSize: 14.5, fontWeight: "700", color: colors.text, marginBottom: 6 },
});
