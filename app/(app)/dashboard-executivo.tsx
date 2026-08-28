// Versão simplificada de src/routes/_authenticated/dashboard-executivo.tsx.
// O original (645 linhas) traz sparklines e vários gráficos com dados mock;
// aqui portamos a estrutura de métricas com contagens REAIS do Supabase
// (usuários, profissionais, atendimentos, faturas), como base para acrescentar
// os gráficos completos depois.
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useQuery } from "@tanstack/react-query";

import { MetricCard } from "@/components/MetricCard";
import { RoleGuard } from "@/components/RoleGuard";
import { colors } from "@/theme/colors";

import { fromTable } from "@/integrations/supabase/typed";
async function countRows(table: string) {
  const { count, error } = await fromTable(table).select("*", { count: "exact", head: true });
  if (error) throw error;
  return count ?? 0;
}

export default function DashboardExecutivoScreen() {
  const usuarios = useQuery({ queryKey: ["metric", "profiles"], queryFn: () => countRows("profiles") });
  const atendimentos = useQuery({ queryKey: ["metric", "appointments"], queryFn: () => countRows("appointments") });
  const clientes = useQuery({ queryKey: ["metric", "clientes"], queryFn: () => countRows("clientes") });
  const faturas = useQuery({ queryKey: ["metric", "pagamentos"], queryFn: () => countRows("pagamentos") });

  return (
    <RoleGuard allowedRoles={["admin", "executivo"]}>
      <ScrollView style={{ flex: 1, backgroundColor: colors.card }} contentContainerStyle={styles.container}>
        <Text style={styles.title}>Painel Executivo</Text>
        <Text style={styles.subtitle}>Visão consolidada da operação ZELAR+</Text>

        <View style={styles.grid}>
          <MetricCard label="Usuários" value={usuarios.data} loading={usuarios.isLoading} />
          <MetricCard label="Clientes" value={clientes.data} loading={clientes.isLoading} />
          <MetricCard label="Atendimentos" value={atendimentos.data} loading={atendimentos.isLoading} />
          <MetricCard label="Pagamentos" value={faturas.data} loading={faturas.isLoading} />
        </View>

        <Text style={styles.note}>
          Gráficos de tendência e exportação (PDF/Excel) do painel original
          ainda serão portados nesta tela.
        </Text>
      </ScrollView>
    </RoleGuard>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 32 },
  title: { fontSize: 22, fontWeight: "800", color: colors.text },
  subtitle: { fontSize: 14, color: colors.textMuted, marginTop: 4, marginBottom: 20 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  note: { marginTop: 24, fontSize: 12.5, color: colors.textMuted, lineHeight: 18 },
});
