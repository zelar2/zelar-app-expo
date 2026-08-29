// Tela-modelo usada pelas rotas ainda não totalmente portadas com sua UI
// original (formulários, tabelas Radix etc). Mantém o caminho de navegação,
// o RBAC e busca dados reais quando uma tabela do Supabase é informada,
// exibindo-os como uma lista de cartões (com busca e badge de status
// detectados automaticamente) em vez de JSON bruto.
import { useCallback, useMemo, useState } from "react";
import { FlatList, RefreshControl, StyleSheet, Text, View } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";

import { fromTable } from "@/integrations/supabase/typed";
import { colors } from "@/theme/colors";
import {
  Badge,
  Card,
  EmptyState,
  ErrorState,
  InitialsAvatar,
  LoadingState,
  SearchInput,
  toneForStatus,
} from "@/components/ui/Kit";

interface GenericScreenProps {
  title: string;
  description?: string;
  /** Nome de uma tabela Supabase para listar como preview (opcional). */
  table?: string;
  /** Rota de detalhe para abrir ao tocar em um item (opcional). */
  detailRoute?: string;
  /** Coluna usada como id ao navegar para o detalhe (padrão "id"). */
  idKey?: string;
}

type Row = Record<string, unknown>;

const TITLE_KEYS = ["full_name", "nome", "titulo", "title", "name", "descricao", "assunto"];
const STATUS_KEYS = ["status", "situacao", "estado"];
const SUBTITLE_KEYS = ["email", "categoria", "category", "tipo", "cidade", "city", "cargo", "especialidade"];
const DATE_KEYS = ["created_at", "data", "date", "data_inicio", "scheduled_at", "vencimento"];

function pick(row: Row, keys: string[]): string | undefined {
  for (const k of keys) {
    const v = row[k];
    if (v !== null && v !== undefined && String(v).trim() !== "") return String(v);
  }
  return undefined;
}

function formatDate(v: string): string {
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return v;
  return d.toLocaleDateString("pt-BR");
}

export function GenericScreen({ title, description, table, detailRoute, idKey = "id" }: GenericScreenProps) {
  const [refreshing, setRefreshing] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["generic-screen", table],
    queryFn: async () => {
      if (!table) return [];
      const { data, error } = await fromTable(table).select("*").order("created_at", { ascending: false }).limit(50);
      if (error) throw error;
      return (data ?? []) as Row[];
    },
    enabled: !!table,
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const filtered = useMemo(() => {
    const rows = data ?? [];
    if (!query.trim()) return rows;
    const q = query.trim().toLowerCase();
    return rows.filter((row) => JSON.stringify(row).toLowerCase().includes(q));
  }, [data, query]);

  return (
    <View style={styles.container}>
      <FlatList
        data={table ? filtered : []}
        keyExtractor={(item, i) => String((item as Row).id ?? i)}
        refreshControl={
          table ? <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} /> : undefined
        }
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        ListHeaderComponent={
          <View style={{ marginBottom: 14 }}>
            <Text style={styles.title}>{title}</Text>
            {description ? <Text style={styles.description}>{description}</Text> : null}

            {!table && (
              <View style={styles.placeholder}>
                <Text style={styles.placeholderText}>
                  Esta tela mantém a rota e o controle de acesso originais do ZELAR+.
                  {"\n\n"}A interface completa (formulários, gráficos e ações específicas
                  desta área) ainda precisa ser portada da versão web.
                </Text>
              </View>
            )}

            {table && !isLoading && !error && (data?.length ?? 0) > 0 && (
              <View style={{ marginTop: 12 }}>
                <SearchInput value={query} onChangeText={setQuery} placeholder={`Buscar em ${title.toLowerCase()}...`} />
              </View>
            )}

            {table && isLoading && <LoadingState />}
            {table && error && <ErrorState message={(error as Error).message} />}
          </View>
        }
        ListEmptyComponent={
          table && !isLoading && !error ? (
            <EmptyState message={query ? "Nenhum resultado para essa busca." : "Nenhum registro encontrado."} />
          ) : null
        }
        renderItem={({ item }) => {
          const row = item as Row;
          const name = pick(row, TITLE_KEYS) ?? `Registro ${String(row.id ?? "").slice(0, 8)}`;
          const status = pick(row, STATUS_KEYS);
          const subtitle = pick(row, SUBTITLE_KEYS);
          const dateRaw = pick(row, DATE_KEYS);

          return (
            <Card
              style={{ marginTop: 10 }}
              onPress={
                detailRoute
                  ? () => router.push({ pathname: detailRoute as never, params: { id: String(row[idKey] ?? "") } })
                  : undefined
              }
            >
              <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                <InitialsAvatar name={name} size={40} />
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={styles.rowTitle} numberOfLines={1}>
                    {name}
                  </Text>
                  {(subtitle || dateRaw) && (
                    <Text style={styles.rowSubtitle} numberOfLines={1}>
                      {[subtitle, dateRaw ? formatDate(dateRaw) : undefined].filter(Boolean).join(" · ")}
                    </Text>
                  )}
                </View>
                {status && <Badge label={status} tone={toneForStatus(status)} />}
              </View>
            </Card>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.card },
  title: { fontSize: 20, fontWeight: "800", color: colors.text },
  description: { fontSize: 14, color: colors.textMuted, marginTop: 4 },
  placeholder: {
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#F5F7FA",
    borderWidth: 1,
    borderColor: colors.border,
  },
  placeholderText: { color: colors.textMuted, fontSize: 13.5, lineHeight: 20 },
  rowTitle: { fontSize: 14.5, fontWeight: "700", color: colors.text },
  rowSubtitle: { fontSize: 12.5, color: colors.textMuted, marginTop: 2 },
});
