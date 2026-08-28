// Histórico do cliente — porta de cliente.$clienteId.historico do projeto
// original. Agrega dados reais de várias tabelas (appointments, evaluations,
// health_records) numa linha do tempo única, em vez de listar uma tabela só.
import { useMemo, useState } from "react";
import { FlatList, RefreshControl, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import { colors } from "@/theme/colors";
import { Badge, Card, EmptyState, ErrorState, LoadingState, toneForStatus } from "@/components/ui/Kit";

interface TimelineItem {
  id: string;
  kind: "Atendimento" | "Avaliação" | "Prontuário";
  title: string;
  status?: string;
  date: string;
}

export default function ClienteHistoricoScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const [refreshing, setRefreshing] = useState(false);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["cliente-historico", id],
    queryFn: async () => {
      if (!id) return [] as TimelineItem[];
      const [appointments, evaluations, records] = await Promise.all([
        supabase.from("appointments").select("*").eq("patient_id", id).order("scheduled_at", { ascending: false }),
        supabase.from("evaluations").select("*").eq("target_user_id", id).order("created_at", { ascending: false }),
        supabase.from("health_records").select("*").eq("patient_id", id).order("created_at", { ascending: false }),
      ]);
      if (appointments.error) throw appointments.error;
      if (evaluations.error) throw evaluations.error;
      if (records.error) throw records.error;

      const items: TimelineItem[] = [
        ...(appointments.data ?? []).map((a) => ({
          id: `appt-${a.id}`,
          kind: "Atendimento" as const,
          title: a.title,
          status: a.status,
          date: a.scheduled_at,
        })),
        ...(evaluations.data ?? []).map((e) => ({
          id: `eval-${e.id}`,
          kind: "Avaliação" as const,
          title: e.comment ?? `Nota ${e.rating}/5`,
          date: e.created_at,
        })),
        ...(records.data ?? []).map((r) => ({
          id: `rec-${r.id}`,
          kind: "Prontuário" as const,
          title: r.title,
          status: r.category,
          date: r.created_at,
        })),
      ];
      return items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    },
    enabled: !!id,
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const items = useMemo(() => data ?? [], [data]);

  return (
    <FlatList
      style={styles.container}
      data={items}
      keyExtractor={(item) => item.id}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
      ListHeaderComponent={
        <View style={{ marginBottom: 6 }}>
          <Text style={styles.title}>Histórico do cliente</Text>
          <Text style={styles.description}>Linha do tempo de atendimentos, avaliações e prontuário.</Text>
          {!id && <Text style={styles.muted}>Nenhum cliente selecionado.</Text>}
          {isLoading && <LoadingState />}
          {error && <ErrorState message={(error as Error).message} />}
        </View>
      }
      ListEmptyComponent={!isLoading && !error && id ? <EmptyState message="Nenhum registro encontrado para este cliente." /> : null}
      renderItem={({ item }) => (
        <Card style={{ marginTop: 10 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
            <View style={{ flex: 1 }}>
              <Text style={styles.kind}>{item.kind}</Text>
              <Text style={styles.itemTitle}>{item.title}</Text>
              <Text style={styles.date}>{new Date(item.date).toLocaleString("pt-BR")}</Text>
            </View>
            {item.status && <Badge label={item.status} tone={toneForStatus(item.status)} />}
          </View>
        </Card>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.card },
  title: { fontSize: 20, fontWeight: "800", color: colors.text },
  description: { fontSize: 14, color: colors.textMuted, marginTop: 4, marginBottom: 8 },
  muted: { color: colors.textMuted, marginTop: 12 },
  kind: { fontSize: 10.5, fontWeight: "800", color: colors.primary, textTransform: "uppercase", letterSpacing: 0.4 },
  itemTitle: { fontSize: 14.5, fontWeight: "700", color: colors.text, marginTop: 3 },
  date: { fontSize: 12, color: colors.textMuted, marginTop: 3 },
});
