import { useCallback, useEffect, useMemo, useState } from "react";
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useRouter } from "expo-router";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/auth-context";
import { colors } from "@/theme/colors";
import {
  Badge,
  Card,
  ChipSelect,
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/components/ui/Kit";

type Filter = "todos" | "agendados" | "concluidos" | "cancelados";

type Atendimento = {
  id: string;
  title: string;
  scheduled_at: string;
  status: string;
  type: string;
  address: string | null;
  observacoes: string | null;
};

const FILTER_OPTIONS = [
  "Todos",
  "Agendados",
  "Concluídos",
  "Cancelados",
];

const FILTER_VALUES: Filter[] = [
  "todos",
  "agendados",
  "concluidos",
  "cancelados",
];

const STATUS_LABEL: Record<string, string> = {
  agendado: "Agendado",
  confirmado: "Confirmado",
  concluido: "Concluído",
  cancelado: "Cancelado",
  em_andamento: "Em andamento",
  em_atendimento: "Em atendimento",
};

const TYPE_LABEL: Record<string, string> = {
  domiciliar: "Domiciliar",
  teleconsulta: "Teleconsulta",
  presencial: "Presencial",
};

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("pt-BR");
}

function statusLabel(status: string) {
  return STATUS_LABEL[status] ?? status;
}

function typeLabel(type: string) {
  return TYPE_LABEL[type] ?? type;
}

function statusTone(status: string) {
  switch (status) {
    case "concluido":
      return "success" as const;
    case "cancelado":
      return "danger" as const;
    case "confirmado":
      return "primary" as const;
    case "agendado":
      return "warning" as const;
    default:
      return "muted" as const;
  }
}

export default function Screen() {
  const router = useRouter();
  const { user } = useAuth();

  const [atendimentos, setAtendimentos] = useState<Atendimento[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("todos");

  const userId = user?.id;

  const load = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError(null);

      if (!userId) {
        setAtendimentos([]);
        setLoading(false);
        setRefreshing(false);
        return;
      }

      const { data, error: queryError } = await supabase
        .from("appointments")
        .select(
          "id, title, scheduled_at, status, type, address, description",
        )
        .eq("patient_id", userId)
        .order("scheduled_at", { ascending: false });

      if (queryError) {
        setError("Erro ao carregar seus atendimentos.");
        setAtendimentos([]);
      } else {
        setAtendimentos(
          (data ?? []).map((item) => ({
            id: item.id,
            title: item.title ?? "Atendimento",
            scheduled_at: item.scheduled_at,
            status: item.status ?? "",
            type: item.type ?? "",
            address: item.address ?? null,
            observacoes: item.description ?? null,
          })),
        );
      }

      setLoading(false);
      setRefreshing(false);
    },
    [userId],
  );

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    return atendimentos.filter((item) => {
      switch (filter) {
        case "agendados":
          return (
            item.status === "agendado" ||
            item.status === "confirmado"
          );
        case "concluidos":
          return item.status === "concluido";
        case "cancelados":
          return item.status === "cancelado";
        default:
          return true;
      }
    });
  }, [atendimentos, filter]);

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Atendimentos</Text>
          <Text style={styles.subtitle}>
            Histórico completo dos seus atendimentos
          </Text>
        </View>
        <LoadingState />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <View style={styles.header}>
            <Text style={styles.title}>Atendimentos</Text>
            <Text style={styles.subtitle}>
              Histórico completo dos seus atendimentos
            </Text>
          </View>
        </View>

        <ErrorState message={error} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              void load(true);
            }}
            tintColor={colors.primary}
          />
        }
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <View>
            <View style={styles.headerRow}>
              <View style={styles.header}>
                <Text style={styles.title}>Meus Atendimentos</Text>
                <Text style={styles.subtitle}>
                  Histórico completo dos seus atendimentos
                </Text>
              </View>

              <View style={styles.iconCircle}>
                <Text style={styles.iconText}>✚</Text>
              </View>
            </View>

            <Card style={styles.hero}>
              <View style={styles.heroRow}>
                <View style={styles.heroText}>
                  <Text style={styles.heroTitle}>Atendimentos</Text>
                  <Text style={styles.heroSubtitle}>
                    Acompanhe todos os seus atendimentos agendados e
                    realizados.
                  </Text>
                </View>

                <View style={styles.heroIcon}>
                  <Text style={styles.heroIconText}>✚</Text>
                </View>
              </View>
            </Card>

            <View style={styles.filterBlock}>
              <ChipSelect
                value={
                  FILTER_OPTIONS[
                    FILTER_VALUES.indexOf(filter)
                  ] ?? "Todos"
                }
                options={FILTER_OPTIONS}
                onChange={(value) => {
                  const index = FILTER_OPTIONS.indexOf(value);
                  setFilter(FILTER_VALUES[index] ?? "todos");
                }}
              />
            </View>

            <View style={styles.listHeader}>
              <Text style={styles.listTitle}>Atendimentos</Text>
              <Text style={styles.count}>
                {filtered.length} resultado
                {filtered.length === 1 ? "" : "s"}
              </Text>
            </View>
          </View>
        }
        ListEmptyComponent={
          <EmptyState message="Nenhum atendimento encontrado." />
        }
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <View style={styles.cardRow}>
              <View style={styles.clockBox}>
                <Text style={styles.clockText}>◷</Text>
              </View>

              <View style={styles.main}>
                <View style={styles.titleRow}>
                  <Text style={styles.itemTitle} numberOfLines={2}>
                    {item.title}
                  </Text>

                  <Badge
                    label={statusLabel(item.status)}
                    tone={statusTone(item.status)}
                  />
                </View>

                <View style={styles.meta}>
                  <Text style={styles.metaItem}>
                    ◷ {formatDate(item.scheduled_at)}
                  </Text>

                  <Text style={styles.metaItem}>
                    {typeLabel(item.type)}
                  </Text>
                </View>

                {item.address ? (
                  <Text style={styles.address} numberOfLines={2}>
                    ⌖ {item.address}
                  </Text>
                ) : null}

                {item.observacoes ? (
                  <Text style={styles.observacoes}>
                    {item.observacoes}
                  </Text>
                ) : null}
              </View>
            </View>
          </Card>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  content: {
    padding: 16,
    paddingBottom: 32,
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },

  header: {
    flex: 1,
    marginBottom: 16,
  },

  title: {
    fontSize: 24,
    fontWeight: "800",
    color: colors.text,
  },

  subtitle: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 3,
  },

  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },

  iconText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
  },

  hero: {
    borderRadius: 24,
    padding: 20,
    backgroundColor: colors.primary,
    borderWidth: 0,
    marginBottom: 16,
  },

  heroRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },

  heroText: {
    flex: 1,
  },

  heroTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#FFFFFF",
  },

  heroSubtitle: {
    fontSize: 13,
    lineHeight: 19,
    color: "#FFFFFF",
    opacity: 0.86,
    marginTop: 5,
  },

  heroIcon: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "#FFFFFF33",
    alignItems: "center",
    justifyContent: "center",
  },

  heroIconText: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "800",
  },

  filterBlock: {
    marginBottom: 18,
  },

  listHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },

  listTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.text,
  },

  count: {
    fontSize: 12,
    color: colors.textMuted,
  },

  card: {
    marginTop: 10,
  },

  cardRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },

  clockBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#2F80ED18",
    alignItems: "center",
    justifyContent: "center",
  },

  clockText: {
    color: colors.primary,
    fontSize: 21,
    fontWeight: "700",
  },

  main: {
    flex: 1,
    minWidth: 0,
  },

  titleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },

  itemTitle: {
    flex: 1,
    fontSize: 14,
    lineHeight: 19,
    fontWeight: "700",
    color: colors.text,
  },

  meta: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 6,
  },

  metaItem: {
    fontSize: 11,
    color: colors.textMuted,
  },

  address: {
    fontSize: 11,
    lineHeight: 16,
    color: colors.textMuted,
    marginTop: 7,
  },

  observacoes: {
    fontSize: 12,
    lineHeight: 17,
    color: colors.textMuted,
    marginTop: 8,
  },
});
