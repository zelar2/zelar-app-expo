// Versão simplificada de src/routes/_authenticated/dashboard-profissional.tsx,
// com métricas reais (contagens Supabase) do profissional autenticado.
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/auth-context";
import { MetricCard } from "@/components/MetricCard";
import { RoleGuard } from "@/components/RoleGuard";
import { colors } from "@/theme/colors";

export default function DashboardProfissionalScreen() {
  const { user } = useAuth();

  const atendimentos = useQuery({
    queryKey: ["metric", "appointments", "mine", user?.id],
    queryFn: async () => {
      if (!user) return 0;
      const { count, error } = await supabase
        .from("appointments")
        .select("*", { count: "exact", head: true })
        .eq("professional_id", user.id);
      if (error) throw error;
      return count ?? 0;
    },
    enabled: !!user,
  });

  const avaliacoes = useQuery({
    queryKey: ["metric", "avaliacoes", "mine", user?.id],
    queryFn: async () => {
      if (!user) return 0;
      const { count, error } = await supabase
        .from("avaliacoes")
        .select("*", { count: "exact", head: true })
        .eq("profissional_id", user.id);
      if (error) throw error;
      return count ?? 0;
    },
    enabled: !!user,
  });

  return (
    <RoleGuard allowedRoles={["admin", "profissional"]}>
      <ScrollView style={{ flex: 1, backgroundColor: colors.card }} contentContainerStyle={styles.container}>
        <Text style={styles.title}>Painel do Profissional</Text>
        <Text style={styles.subtitle}>Resumo da sua atuação na ZELAR+</Text>

        <View style={styles.grid}>
          <MetricCard label="Meus atendimentos" value={atendimentos.data} loading={atendimentos.isLoading} />
          <MetricCard label="Minhas avaliações" value={avaliacoes.data} loading={avaliacoes.isLoading} />
        </View>
      </ScrollView>
    </RoleGuard>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 32 },
  title: { fontSize: 22, fontWeight: "800", color: colors.text },
  subtitle: { fontSize: 14, color: colors.textMuted, marginTop: 4, marginBottom: 20 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
});
