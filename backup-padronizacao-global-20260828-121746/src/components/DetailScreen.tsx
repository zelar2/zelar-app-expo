// Tela genérica de detalhe (equivalente simplificado às rotas dinâmicas do
// original, ex: usuarios.$usuarioId.tsx, cliente.$clienteId.tsx): busca uma
// linha real do Supabase pelo id recebido via parâmetro de navegação e
// apresenta como uma ficha (cabeçalho com avatar/nome/status + campos),
// em vez da lista bruta de chave/valor.
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useQuery } from "@tanstack/react-query";

import { colors } from "@/theme/colors";
import { Badge, Card, ErrorState, Field, InitialsAvatar, LoadingState, toneForStatus } from "@/components/ui/Kit";

import { fromTable } from "@/integrations/supabase/typed";
interface DetailScreenProps {
  title: string;
  table: string;
  id: string | undefined;
  idColumn?: string;
}

const NAME_KEYS = ["full_name", "nome", "titulo", "title", "name", "descricao", "assunto"];
const STATUS_KEYS = ["status", "situacao", "estado"];
const HIDDEN_KEYS = new Set(["id"]);

function formatValue(key: string, value: unknown): string {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "boolean") return value ? "Sim" : "Não";
  if (/(_at|^data|_date)$/i.test(key)) {
    const d = new Date(String(value));
    if (!Number.isNaN(d.getTime())) return d.toLocaleString("pt-BR");
  }
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function prettyLabel(key: string): string {
  return key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function DetailScreen({ title, table, id, idColumn = "id" }: DetailScreenProps) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["detail", table, id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await fromTable(table).select("*").eq(idColumn, id).maybeSingle();
      if (error) throw error;
      return data as Record<string, unknown> | null;
    },
    enabled: !!id,
  });

  const name = data ? (NAME_KEYS.map((k) => data[k]).find(Boolean) as string | undefined) ?? title : title;
  const status = data ? (STATUS_KEYS.map((k) => data[k]).find(Boolean) as string | undefined) : undefined;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.card }} contentContainerStyle={styles.container}>
      {!id && <Text style={styles.muted}>Nenhum registro selecionado.</Text>}
      {id && isLoading && <LoadingState />}
      {id && error && <ErrorState message={(error as Error).message} />}
      {id && !isLoading && !error && !data && <Text style={styles.muted}>Registro não encontrado.</Text>}

      {data && (
        <>
          <Card style={styles.header}>
            <InitialsAvatar name={name} size={56} />
            <Text style={styles.name}>{name}</Text>
            {status && (
              <View style={{ marginTop: 6 }}>
                <Badge label={status} tone={toneForStatus(status)} />
              </View>
            )}
          </Card>

          <Card style={{ marginTop: 12 }}>
            {Object.entries(data)
              .filter(([key]) => !HIDDEN_KEYS.has(key))
              .map(([key, value]) => (
                <Field key={key} label={prettyLabel(key)} value={formatValue(key, value)} />
              ))}
          </Card>

          <Text style={styles.note}>
            Esta ficha mostra todos os campos reais deste registro. Ações e edição
            completa (iguais à versão web) ainda serão portadas.
          </Text>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 32 },
  header: { alignItems: "center", paddingVertical: 20 },
  name: { fontSize: 17, fontWeight: "800", color: colors.text, marginTop: 10, textAlign: "center" },
  muted: { color: colors.textMuted, marginTop: 12 },
  note: { marginTop: 16, fontSize: 12, color: colors.textMuted, lineHeight: 18 },
});
