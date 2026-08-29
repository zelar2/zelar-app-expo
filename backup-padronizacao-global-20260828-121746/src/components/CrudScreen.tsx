// Tela genérica de CRUD real: lista + busca + criar/editar/excluir via
// Supabase. Substitui o GenericScreen (somente leitura) nas telas de
// cadastro do ZELAR+ (RH, financeiro, documentos etc). Cada tela concreta
// só declara os campos (FieldDef[]) e a tabela; toda a lógica de
// insert/update/delete é real e compartilhada aqui.
import { useCallback, useMemo, useState } from "react";
import { Alert, FlatList, Modal, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";

import { fromTable } from "@/integrations/supabase/typed";
import { useAuth } from "@/context/auth-context";
import { colors } from "@/theme/colors";
import {
  AppButton,
  Badge,
  Card,
  ChipSelect,
  EmptyState,
  ErrorState,
  FAB,
  FormField,
  InitialsAvatar,
  LoadingState,
  SearchInput,
  SwitchField,
  TextField,
  toneForStatus,
} from "@/components/ui/Kit";

export interface FieldDef {
  key: string;
  label: string;
  type?: "text" | "number" | "textarea" | "boolean" | "select" | "date";
  options?: string[];
  required?: boolean;
  /** Preenche automaticamente com o usuário logado ao criar (ex: created_by). */
  autoUser?: boolean;
}

type Row = Record<string, unknown>;

const TITLE_KEYS = ["full_name", "nome", "titulo", "title", "name", "descricao", "assunto", "label"];
const STATUS_KEYS = ["status", "situacao", "estado", "tipo"];
const SUBTITLE_KEYS = ["email", "categoria", "category", "cidade", "city", "cargo", "especialidade", "periodo", "mes_referencia"];
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

function emptyValues(fields: FieldDef[]): Row {
  const v: Row = {};
  for (const f of fields) v[f.key] = f.type === "boolean" ? false : "";
  return v;
}

export interface CrudScreenProps {
  title: string;
  description?: string;
  table: string;
  fields: FieldDef[];
  detailRoute?: string;
  /** Se true (padrão), permite criar/editar/excluir. Telas somente-consulta podem passar false. */
  editable?: boolean;
  orderBy?: string;
}

export function CrudScreen({ title, description, table, fields, detailRoute, editable = true, orderBy = "created_at" }: CrudScreenProps) {
  const [refreshing, setRefreshing] = useState(false);
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<Row | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [values, setValues] = useState<Row>({});
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const qc = useQueryClient();
  const { user } = useAuth();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["crud", table],
    queryFn: async () => {
      const { data, error } = await fromTable(table).select("*").order(orderBy, { ascending: false }).limit(200);
      if (error) throw error;
      return (data ?? []) as Row[];
    },
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

  function openCreate() {
    setEditing(null);
    setValues(emptyValues(fields));
    setFormOpen(true);
  }

  function openEdit(row: Row) {
    setEditing(row);
    setValues({ ...row });
    setFormOpen(true);
  }

  async function handleSave() {
    setSaving(true);
    try {
      const payload: Row = {};
      for (const f of fields) {
        if (f.autoUser && !editing) {
          payload[f.key] = user?.id ?? null;
          continue;
        }
        payload[f.key] = values[f.key] === "" ? null : values[f.key];
      }
      if (editing) {
        const { error } = await fromTable(table).update(payload).eq("id", editing.id as string);
        if (error) throw error;
      } else {
        const { error } = await fromTable(table).insert(payload);
        if (error) throw error;
      }
      setFormOpen(false);
      await qc.invalidateQueries({ queryKey: ["crud", table] });
    } catch (e) {
      Alert.alert("Erro ao salvar", (e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  function handleDelete() {
    if (!editing) return;
    Alert.alert("Excluir registro", "Tem certeza que deseja excluir este registro?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Excluir",
        style: "destructive",
        onPress: async () => {
          const { error } = await fromTable(table).delete().eq("id", editing.id as string);
          if (error) {
            Alert.alert("Erro ao excluir", error.message);
            return;
          }
          setFormOpen(false);
          await qc.invalidateQueries({ queryKey: ["crud", table] });
        },
      },
    ]);
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={filtered}
        keyExtractor={(item, i) => String((item as Row).id ?? i)}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        contentContainerStyle={{ padding: 16, paddingBottom: 96 }}
        ListHeaderComponent={
          <View style={{ marginBottom: 14 }}>
            <Text style={styles.title}>{title}</Text>
            {description ? <Text style={styles.description}>{description}</Text> : null}
            {!isLoading && !error && (data?.length ?? 0) > 0 && (
              <View style={{ marginTop: 12 }}>
                <SearchInput value={query} onChangeText={setQuery} placeholder={`Buscar em ${title.toLowerCase()}...`} />
              </View>
            )}
            {isLoading && <LoadingState />}
            {error && <ErrorState message={(error as Error).message} />}
          </View>
        }
        ListEmptyComponent={
          !isLoading && !error ? (
            <EmptyState message={query ? "Nenhum resultado para essa busca." : "Nenhum registro encontrado. Toque em + para criar o primeiro."} />
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
              onPress={() => {
                if (detailRoute) {
                  router.push({ pathname: detailRoute as never, params: { id: String(row.id ?? "") } });
                } else if (editable) {
                  openEdit(row);
                }
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                <InitialsAvatar name={name} size={40} />
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={styles.rowTitle} numberOfLines={1}>{name}</Text>
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

      {editable && <FAB onPress={openCreate} />}

      <Modal visible={formOpen} animationType="slide" transparent onRequestClose={() => setFormOpen(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>{editing ? "Editar" : "Novo"} · {title}</Text>
            <ScrollView style={{ maxHeight: 420 }} showsVerticalScrollIndicator={false}>
              {fields.filter((f) => !f.autoUser).map((f) => (
                <FormField key={f.key} label={f.label} required={f.required}>
                  {f.type === "boolean" ? (
                    <SwitchField
                      value={Boolean(values[f.key])}
                      onValueChange={(v) => setValues((s) => ({ ...s, [f.key]: v }))}
                    />
                  ) : f.type === "select" && f.options ? (
                    <ChipSelect
                      value={String(values[f.key] ?? "")}
                      options={f.options}
                      onChange={(v) => setValues((s) => ({ ...s, [f.key]: v }))}
                    />
                  ) : (
                    <TextField
                      value={values[f.key] === null || values[f.key] === undefined ? "" : String(values[f.key])}
                      onChangeText={(v) => setValues((s) => ({ ...s, [f.key]: v }))}
                      multiline={f.type === "textarea"}
                      keyboardType={f.type === "number" ? "numeric" : "default"}
                      placeholder={f.type === "date" ? "AAAA-MM-DD" : undefined}
                    />
                  )}
                </FormField>
              ))}
            </ScrollView>
            <View style={{ flexDirection: "row", gap: 10, marginTop: 8 }}>
              <View style={{ flex: 1 }}>
                <AppButton label="Cancelar" variant="outline" onPress={() => setFormOpen(false)} />
              </View>
              <View style={{ flex: 1 }}>
                <AppButton label={saving ? "Salvando..." : "Salvar"} onPress={handleSave} disabled={saving} />
              </View>
            </View>
            {editing && (
              <View style={{ marginTop: 10 }}>
                <AppButton label="Excluir registro" variant="outline" onPress={handleDelete} />
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.card },
  title: { fontSize: 20, fontWeight: "800", color: colors.text },
  description: { fontSize: 14, color: colors.textMuted, marginTop: 4 },
  rowTitle: { fontSize: 14.5, fontWeight: "700", color: colors.text },
  rowSubtitle: { fontSize: 12.5, color: colors.textMuted, marginTop: 2 },
  modalBackdrop: { flex: 1, backgroundColor: "rgba(51,51,51,0.40)", justifyContent: "flex-end" },
  sheet: { backgroundColor: colors.card, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 18, paddingBottom: 28 },
  sheetTitle: { fontSize: 16, fontWeight: "800", color: colors.text, marginBottom: 14 },
});
