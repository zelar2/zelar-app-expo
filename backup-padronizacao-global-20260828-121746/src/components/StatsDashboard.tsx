// Componente compartilhado para os painéis agregados (Analytics,
// Monitoramento, Status do sistema): busca contagens reais de várias
// tabelas Supabase em paralelo e mostra como StatCards.
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useQuery } from "@tanstack/react-query";

import { colors } from "@/theme/colors";
import { StatCard } from "@/components/ui/Kit";

import { fromTable } from "@/integrations/supabase/typed";
export interface MetricSpec {
  label: string;
  table: string;
  filter?: { column: string; value: string };
}

async function countTable(table: string, filter?: { column: string; value: string }) {
  let query = fromTable(table).select("*", { count: "exact", head: true });
  if (filter) query = query.eq(filter.column, filter.value);
  const { count, error } = await query;
  if (error) throw error;
  return count ?? 0;
}

export function StatsDashboard({ title, subtitle, metrics }: { title: string; subtitle?: string; metrics: MetricSpec[] }) {
  const { data, isLoading } = useQuery({
    queryKey: ["stats-dashboard", title, metrics.map((m) => m.table + (m.filter?.value ?? "")).join(",")],
    queryFn: async () => {
      const results = await Promise.all(metrics.map((m) => countTable(m.table, m.filter)));
      return results;
    },
  });

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      <View style={styles.grid}>
        {metrics.map((m, i) => (
          <StatCard key={m.label} label={m.label} value={isLoading ? "…" : String(data?.[i] ?? 0)} />
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.card },
  title: { fontSize: 20, fontWeight: "800", color: colors.text },
  subtitle: { fontSize: 13.5, color: colors.textMuted, marginTop: 4, marginBottom: 16 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 12 },
});
