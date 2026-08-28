// Porta completa de src/routes/_authenticated/meus-documentos.tsx: lista dos
// documentos profissionais enviados pelo usuário (tabela
// `profissional_documentos`) com status (pendente/aprovado/rejeitado/assinado).
import { useCallback, useEffect, useState } from "react";
import { FlatList, Linking, Pressable, RefreshControl, StyleSheet, Text, View } from "react-native";
import { Stack } from "expo-router";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/auth-context";
import { colors } from "@/theme/colors";
import { EmptyState, LoadingState } from "@/components/ui/Kit";

type DocStatus = "pendente" | "aprovado" | "rejeitado" | "assinado";
type DocType = "rg" | "cpf" | "coren" | "crm" | "cro" | "diploma" | "certidao" | "outro";

const STATUS_LABEL: Record<DocStatus, string> = {
  pendente: "Pendente",
  aprovado: "Aprovado",
  rejeitado: "Rejeitado",
  assinado: "Assinado",
};

const STATUS_COLOR: Record<DocStatus, { bg: string; fg: string }> = {
  pendente: { bg: colors.warning + "1A", fg: colors.warning },
  aprovado: { bg: colors.success + "1A", fg: colors.success },
  rejeitado: { bg: colors.danger + "1A", fg: colors.danger },
  assinado: { bg: colors.primary + "1A", fg: colors.primaryDark },
};

const TYPE_LABEL: Record<DocType, string> = {
  rg: "RG",
  cpf: "CPF",
  coren: "COREN",
  crm: "CRM",
  cro: "CRO",
  diploma: "Diploma",
  certidao: "Certidão",
  outro: "Outro",
};

interface Documento {
  id: string;
  title: string;
  type: DocType;
  status: DocStatus;
  file_url: string | null;
  file_name: string | null;
  observacoes: string | null;
  created_at: string;
}

export default function MeusDocumentosScreen() {
  const { user } = useAuth();
  const [docs, setDocs] = useState<Documento[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    const { data, error } = await supabase
      .from("profissional_documentos")
      .select("id, title, type, status, file_url, file_name, observacoes, created_at")
      .eq("profissional_id", user.id)
      .order("created_at", { ascending: false });

    if (!error) setDocs((data as Documento[] | null) ?? []);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    void load();
  }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  return (
    <View style={styles.screen}>
      <Stack.Screen options={{ title: "Meus documentos" }} />

      <FlatList
        data={docs}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        ListHeaderComponent={
          <View>
            <View style={styles.hero}>
              <Text style={styles.heroTitle}>Documentos</Text>
              <Text style={styles.heroSubtitle}>
                Visualize e acompanhe o status dos documentos enviados.
              </Text>
            </View>
            {loading && <LoadingState />}
          </View>
        }
        ListEmptyComponent={!loading ? <EmptyState message="Nenhum documento encontrado." /> : null}
        renderItem={({ item: d }) => {
          const c = STATUS_COLOR[d.status];
          return (
            <View style={styles.card}>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <Text style={styles.cardTitle} numberOfLines={1}>
                    {d.title}
                  </Text>
                  <View style={[styles.badge, { backgroundColor: c.bg }]}>
                    <Text style={[styles.badgeText, { color: c.fg }]}>{STATUS_LABEL[d.status]}</Text>
                  </View>
                </View>
                <Text style={styles.cardMeta}>
                  {TYPE_LABEL[d.type]} · {new Date(d.created_at).toLocaleDateString("pt-BR")}
                </Text>
                {d.observacoes ? <Text style={styles.cardObs}>{d.observacoes}</Text> : null}
              </View>
              {d.file_url ? (
                <Pressable style={styles.viewButton} onPress={() => Linking.openURL(d.file_url!)}>
                  <Text style={styles.viewButtonText}>Ver</Text>
                </Pressable>
              ) : null}
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.card },
  container: { padding: 16, paddingBottom: 32 },
  hero: { borderRadius: 24, backgroundColor: colors.primary, padding: 20 },
  heroTitle: { fontSize: 19, fontWeight: "800", color: "#FFFFFF" },
  heroSubtitle: { marginTop: 4, fontSize: 13, color: "rgba(255,255,255,0.85)" },
  card: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    padding: 14,
  },
  cardTitle: { fontSize: 14, fontWeight: "700", color: colors.text, flexShrink: 1 },
  cardMeta: { fontSize: 12, color: colors.textMuted, marginTop: 4 },
  cardObs: { fontSize: 12, color: colors.textMuted, marginTop: 4, fontStyle: "italic" },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999 },
  badgeText: { fontSize: 10, fontWeight: "700" },
  viewButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: colors.primary + "1A",
  },
  viewButtonText: { fontSize: 12, fontWeight: "700", color: colors.primary },
});
