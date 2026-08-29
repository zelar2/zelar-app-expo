// ZELAR+ — Meus documentos
// Lista profissional_documentos do usuário autenticado.
// Arquivos do bucket podem ser privados; a abertura usa signed URL.

import { useCallback, useEffect, useState } from "react";
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
  Alert,
} from "react-native";
import { Stack } from "expo-router";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/auth-context";
import { colors } from "@/theme/colors";
import {
  EmptyState,
  LoadingState,
} from "@/components/ui/Kit";

type DocStatus =
  | "pendente"
  | "aprovado"
  | "recusado"
  | "assinado"
  | "rejeitado";

type DocumentoTipo =
  | "coren"
  | "crm"
  | "crp"
  | "crefito"
  | "crfa"
  | "crn"
  | "rg"
  | "cpf"
  | "diploma"
  | "certificado"
  | "comprovante_endereco"
  | "outro";

interface Documento {
  id: string;
  title: string | null;
  type: string | null;
  tipo: DocumentoTipo;
  status: DocStatus;
  file_path: string;
  file_name: string | null;
  observacoes: string | null;
  motivo_recusa: string | null;
  created_at: string;
}

const STATUS_LABEL: Record<DocStatus, string> = {
  pendente: "Pendente",
  aprovado: "Aprovado",
  recusado: "Recusado",
  assinado: "Assinado",
  rejeitado: "Rejeitado",
};

const STATUS_COLOR: Record<
  DocStatus,
  { bg: string; fg: string }
> = {
  pendente: {
    bg: colors.warning + "1A",
    fg: colors.warning,
  },

  aprovado: {
    bg: colors.success + "1A",
    fg: colors.success,
  },

  recusado: {
    bg: colors.danger + "1A",
    fg: colors.danger,
  },

  rejeitado: {
    bg: colors.danger + "1A",
    fg: colors.danger,
  },

  assinado: {
    bg: colors.primary + "1A",
    fg: colors.primaryDark,
  },
};

const TYPE_LABEL: Record<DocumentoTipo, string> = {
  coren: "COREN",
  crm: "CRM",
  crp: "CRP",
  crefito: "CREFITO",
  crfa: "CRFA",
  crn: "CRN",
  rg: "RG",
  cpf: "CPF",
  diploma: "Diploma",
  certificado: "Certificado",
  comprovante_endereco: "Comprovante de endereço",
  outro: "Outro",
};

export default function MeusDocumentosScreen() {
  const { user } = useAuth();

  const [docs, setDocs] = useState<Documento[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [openingId, setOpeningId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) {
      setDocs([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const { data, error } = await supabase
      .from("profissional_documentos")
      .select(
        [
          "id",
          "title",
          "type",
          "tipo",
          "status",
          "file_path",
          "file_name",
          "observacoes",
          "motivo_recusa",
          "created_at",
        ].join(", "),
      )
      .eq("profissional_id", user.id)
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      Alert.alert(
        "Erro",
        `Não foi possível carregar os documentos.\n\n${error.message}`,
      );

      setDocs([]);
    } else {
      setDocs(((data ?? []) as unknown) as Documento[]);
    }

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

  async function openDocument(documento: Documento) {
    if (!documento.file_path) {
      Alert.alert(
        "Arquivo indisponível",
        "Este documento não possui caminho de arquivo.",
      );
      return;
    }

    setOpeningId(documento.id);

    try {
      const { data, error } = await supabase.storage
        .from("documentos")
        .createSignedUrl(documento.file_path, 300);

      if (error) {
        throw error;
      }

      if (!data?.signedUrl) {
        throw new Error(
          "Não foi possível gerar o endereço temporário do arquivo.",
        );
      }

      // Import dinâmico para evitar dependência desnecessária
      // enquanto a tela não é utilizada.
      const Linking =
        await import("react-native").then(
          (module) => module.Linking,
        );

      await Linking.openURL(data.signedUrl);
    } catch (error) {
      Alert.alert(
        "Erro ao abrir documento",
        error instanceof Error
          ? error.message
          : "Não foi possível abrir o documento.",
      );
    } finally {
      setOpeningId(null);
    }
  }

  return (
    <View style={styles.screen}>
      <Stack.Screen
        options={{ title: "Meus documentos" }}
      />

      <FlatList
        data={docs}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
        ListHeaderComponent={
          <View>
            <View style={styles.hero}>
              <Text style={styles.heroTitle}>
                Documentos
              </Text>

              <Text style={styles.heroSubtitle}>
                Visualize e acompanhe o status dos documentos
                enviados.
              </Text>
            </View>

            {loading ? <LoadingState /> : null}
          </View>
        }
        ListEmptyComponent={
          !loading ? (
            <EmptyState message="Nenhum documento encontrado." />
          ) : null
        }
        renderItem={({ item }) => {
          const status =
            STATUS_COLOR[item.status] ??
            STATUS_COLOR.pendente;

          const tipo =
            TYPE_LABEL[item.tipo] ?? item.tipo;

          const titulo =
            item.title ||
            item.type ||
            tipo;

          const data = new Date(
            item.created_at,
          ).toLocaleDateString("pt-BR");

          const observacao =
            item.observacoes ||
            item.motivo_recusa;

          return (
            <View style={styles.card}>
              <View style={styles.cardContent}>
                <View style={styles.titleRow}>
                  <Text
                    style={styles.cardTitle}
                    numberOfLines={2}
                  >
                    {titulo}
                  </Text>

                  <View
                    style={[
                      styles.badge,
                      {
                        backgroundColor:
                          status.bg,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.badgeText,
                        {
                          color: status.fg,
                        },
                      ]}
                    >
                      {STATUS_LABEL[item.status]}
                    </Text>
                  </View>
                </View>

                <Text style={styles.cardMeta}>
                  {tipo} · {data}
                </Text>

                {item.file_name ? (
                  <Text
                    style={styles.fileName}
                    numberOfLines={1}
                  >
                    {item.file_name}
                  </Text>
                ) : null}

                {observacao ? (
                  <Text style={styles.cardObs}>
                    {observacao}
                  </Text>
                ) : null}

                <Pressable
                  style={[
                    styles.viewButton,
                    openingId === item.id &&
                      styles.viewButtonDisabled,
                  ]}
                  onPress={() =>
                    void openDocument(item)
                  }
                  disabled={
                    openingId === item.id
                  }
                >
                  <Text
                    style={styles.viewButtonText}
                  >
                    {openingId === item.id
                      ? "Abrindo..."
                      : "Ver documento"}
                  </Text>
                </Pressable>
              </View>
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },

  container: {
    padding: 16,
    paddingBottom: 32,
  },

  hero: {
    borderRadius: 24,
    backgroundColor: colors.primary,
    padding: 20,
    marginBottom: 4,
  },

  heroTitle: {
    fontSize: 19,
    fontWeight: "800",
    color: "#FFFFFF",
  },

  heroSubtitle: {
    marginTop: 4,
    fontSize: 13,
    color: "rgba(255,255,255,0.85)",
  },

  card: {
    marginTop: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    padding: 14,
  },

  cardContent: {
    flex: 1,
  },

  titleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },

  cardTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: "700",
    color: colors.text,
  },

  cardMeta: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 5,
  },

  fileName: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 5,
  },

  cardObs: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 5,
    fontStyle: "italic",
  },

  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },

  badgeText: {
    fontSize: 10,
    fontWeight: "700",
  },

  viewButton: {
    marginTop: 12,
    alignSelf: "flex-start",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: colors.primary + "1A",
  },

  viewButtonDisabled: {
    opacity: 0.5,
  },

  viewButtonText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.primary,
  },
});
