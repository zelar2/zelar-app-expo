// Notificações do usuário logado — lista real da tabela "notifications"
// filtrada por user_id, com ação de marcar como lida.
import { useCallback, useState } from "react";
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from "react-native";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/auth-context";
import { colors } from "@/theme/colors";
import { Badge, Card, EmptyState, ErrorState, LoadingState } from "@/components/ui/Kit";

interface Notification {
  id: string;
  title: string;
  message: string | null;
  type: string;
  read: boolean;
  created_at: string;
}

export default function NotificacoesScreen() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["notificacoes", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return (data ?? []) as Notification[];
    },
    enabled: !!user,
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  async function markRead(n: Notification) {
    if (n.read) return;
    await supabase.from("notifications").update({ read: true }).eq("id", n.id);
    qc.invalidateQueries({ queryKey: ["notificacoes", user?.id] });
  }

  return (
    <FlatList
      style={styles.container}
      data={data ?? []}
      keyExtractor={(item) => item.id}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
      ListHeaderComponent={
        <View style={{ marginBottom: 6 }}>
          <Text style={styles.title}>Notificações</Text>
          {isLoading && <LoadingState />}
          {error && <ErrorState message={(error as Error).message} />}
        </View>
      }
      ListEmptyComponent={!isLoading && !error ? <EmptyState message="Nenhuma notificação por aqui." /> : null}
      renderItem={({ item }) => (
        <Pressable onPress={() => markRead(item)}>
          <Card style={[{ marginTop: 10 }, !item.read && styles.unread]}>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text style={styles.itemTitle}>{item.title}</Text>
              {!item.read && <Badge label="Nova" tone="primary" />}
            </View>
            {item.message ? <Text style={styles.message}>{item.message}</Text> : null}
            <Text style={styles.date}>{new Date(item.created_at).toLocaleString("pt-BR")}</Text>
          </Card>
        </Pressable>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.card },
  title: { fontSize: 20, fontWeight: "800", color: colors.text },
  unread: { borderColor: colors.primary },
  itemTitle: { fontSize: 14.5, fontWeight: "700", color: colors.text, flex: 1 },
  message: { fontSize: 13, color: colors.textMuted, marginTop: 4 },
  date: { fontSize: 11.5, color: colors.textMuted, marginTop: 6 },
});
