// Status do sistema — saúde geral: volumes das principais tabelas +
// último backup registrado.
import { useState } from "react";
import { RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import { colors } from "@/theme/colors";
import { Badge, Card, StatCard, toneForStatus } from "@/components/ui/Kit";

export default function StatusSistemaScreen() {
  const [refreshing, setRefreshing] = useState(false);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["status-sistema"],
    queryFn: async () => {
      const [users, calls, lastBackup] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("service_calls").select("*", { count: "exact", head: true }),
        supabase.from("backups").select("label, status, created_at").order("created_at", { ascending: false }).limit(1).maybeSingle(),
      ]);
      return {
        usersCount: users.count ?? 0,
        callsCount: calls.count ?? 0,
        lastBackup: lastBackup.data,
      };
    },
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
    >
      <Text style={styles.title}>Status do sistema</Text>
      <Text style={styles.subtitle}>Conexão com Supabase e volumes de dados.</Text>

      <View style={styles.grid}>
        <StatCard label="Usuários cadastrados" value={isLoading ? "…" : String(data?.usersCount ?? 0)} tone="success" />
        <StatCard label="Chamadas registradas" value={isLoading ? "…" : String(data?.callsCount ?? 0)} tone="primary" />
      </View>

      <Card style={{ marginTop: 16 }}>
        <Text style={styles.cardTitle}>Último backup</Text>
        {data?.lastBackup ? (
          <>
            <Text style={styles.value}>{data.lastBackup.label}</Text>
            <View style={{ marginTop: 6, flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Badge label={data.lastBackup.status} tone={toneForStatus(data.lastBackup.status)} />
              <Text style={styles.date}>{new Date(data.lastBackup.created_at).toLocaleString("pt-BR")}</Text>
            </View>
          </>
        ) : (
          <Text style={styles.date}>Nenhum backup registrado ainda.</Text>
        )}
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.card },
  title: { fontSize: 20, fontWeight: "800", color: colors.text },
  subtitle: { fontSize: 13.5, color: colors.textMuted, marginTop: 4, marginBottom: 8 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 8 },
  cardTitle: { fontSize: 12, fontWeight: "700", color: colors.textMuted, textTransform: "uppercase" },
  value: { fontSize: 15, fontWeight: "700", color: colors.text, marginTop: 6 },
  date: { fontSize: 12, color: colors.textMuted },
});
