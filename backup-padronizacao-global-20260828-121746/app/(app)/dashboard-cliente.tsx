// Painel do cliente — resumo real dos próprios atendimentos, contratos e
// pagamentos do usuário logado (paciente/cliente/familiar).
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/auth-context";
import { colors } from "@/theme/colors";
import { Badge, Card, LoadingState, StatCard, toneForStatus } from "@/components/ui/Kit";

export default function DashboardClienteScreen() {
  const { user } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ["dashboard-cliente", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const [proximos, pendentes] = await Promise.all([
        supabase
          .from("appointments")
          .select("*")
          .eq("patient_id", user.id)
          .gte("scheduled_at", new Date().toISOString())
          .order("scheduled_at", { ascending: true })
          .limit(5),
        supabase.from("pagamentos").select("*", { count: "exact", head: true }).eq("cliente_id", user.id).eq("status", "pendente"),
      ]);
      if (proximos.error) throw proximos.error;
      return { proximos: proximos.data ?? [], pendentesCount: pendentes.count ?? 0 };
    },
    enabled: !!user,
  });

  if (isLoading) return <LoadingState />;

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
      <Text style={styles.title}>Painel do cliente</Text>
      <Text style={styles.subtitle}>Seus próximos atendimentos e pendências.</Text>

      <View style={styles.grid}>
        <StatCard label="Próximos atendimentos" value={String(data?.proximos.length ?? 0)} tone="primary" />
        <StatCard label="Pagamentos pendentes" value={String(data?.pendentesCount ?? 0)} tone="warning" />
      </View>

      <Text style={styles.sectionTitle}>Próximos atendimentos</Text>
      {(data?.proximos ?? []).length === 0 && <Text style={styles.muted}>Nenhum atendimento agendado.</Text>}
      {(data?.proximos ?? []).map((a) => (
        <Card key={a.id} style={{ marginTop: 10 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <Text style={styles.itemTitle}>{a.title}</Text>
            <Badge label={a.status} tone={toneForStatus(a.status)} />
          </View>
          <Text style={styles.date}>{new Date(a.scheduled_at).toLocaleString("pt-BR")}</Text>
        </Card>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.card },
  title: { fontSize: 20, fontWeight: "800", color: colors.text },
  subtitle: { fontSize: 13.5, color: colors.textMuted, marginTop: 4, marginBottom: 8 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 8 },
  sectionTitle: { fontSize: 13, fontWeight: "800", color: colors.textMuted, textTransform: "uppercase", marginTop: 22, marginBottom: 6 },
  muted: { color: colors.textMuted, fontSize: 13.5 },
  itemTitle: { fontSize: 14.5, fontWeight: "700", color: colors.text },
  date: { fontSize: 12, color: colors.textMuted, marginTop: 4 },
});
