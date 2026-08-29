// Porta completa de src/routes/_authenticated/financeiro.tsx: carteira,
// movimentação recente, tabela de honorários (catálogo real de
// src/data/service-catalog.ts) com abas por categoria e busca, carrinho de
// orçamento com controle de quantidade, orçamentos salvos (CRUD real na
// tabela `quotes`) e modal de salvar/editar orçamento.
import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Stack } from "expo-router";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/auth-context";
import { colors } from "@/theme/colors";
import { AppButton, Badge, Card, LoadingState } from "@/components/ui/Kit";
import { SERVICE_CATALOG, formatBRL, type CatalogGroup, type CatalogService } from "@/data/service-catalog";

type LineItem = { key: string; group: CatalogGroup; service: CatalogService; qty: number };
type QuoteStatus = "rascunho" | "enviado" | "aprovado" | "recusado";
type SavedItem = {
  key: string;
  category: string;
  groupLabel: string;
  code: string;
  title: string;
  unit: string;
  priceCents: number;
  qty: number;
};
type QuoteRow = {
  id: string;
  title: string;
  client_name: string | null;
  notes: string | null;
  items: unknown;
  total_cents: number;
  status: QuoteStatus;
  updated_at: string;
};

const STATUS_LABEL: Record<QuoteStatus, string> = {
  rascunho: "Rascunho",
  enviado: "Enviado",
  aprovado: "Aprovado",
  recusado: "Recusado",
};

function toSavedItems(cart: LineItem[]): SavedItem[] {
  return cart.map((i) => ({
    key: i.key,
    category: i.group.category,
    groupLabel: i.group.label,
    code: i.service.code,
    title: i.service.title,
    unit: i.service.unit,
    priceCents: i.service.priceCents,
    qty: i.qty,
  }));
}

function fromSavedItems(items: unknown): LineItem[] {
  if (!Array.isArray(items)) return [];
  return (items as SavedItem[])
    .map((it) => {
      const group =
        SERVICE_CATALOG.find((g) => g.category === it.category) ??
        SERVICE_CATALOG.find((g) => g.services.some((s) => s.code === it.code));
      if (!group) return null;
      const service = group.services.find((s) => s.code === it.code) ?? {
        code: it.code,
        title: it.title,
        unit: it.unit,
        priceCents: it.priceCents,
      };
      return { key: `${group.category}:${service.code}`, group, service, qty: Math.max(1, Number(it.qty) || 1) } as LineItem;
    })
    .filter(Boolean) as LineItem[];
}

export default function FinanceiroScreen() {
  const { user } = useAuth();
  const [tab, setTab] = useState<string>(SERVICE_CATALOG[0].category);
  const [query, setQuery] = useState("");
  const [cart, setCart] = useState<LineItem[]>([]);

  const [quotes, setQuotes] = useState<QuoteRow[]>([]);
  const [loadingQuotes, setLoadingQuotes] = useState(true);
  const [saveOpen, setSaveOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", client_name: "", notes: "", status: "rascunho" as QuoteStatus });

  const loadQuotes = useCallback(async () => {
    if (!user) return;
    setLoadingQuotes(true);
    const { data, error } = await supabase
      .from("quotes")
      .select("id,title,client_name,notes,items,total_cents,status,updated_at")
      .order("updated_at", { ascending: false });
    if (error) Alert.alert("Erro", "Não foi possível carregar os orçamentos");
    setQuotes((data as QuoteRow[]) ?? []);
    setLoadingQuotes(false);
  }, [user]);

  useEffect(() => {
    void loadQuotes();
  }, [loadQuotes]);

  const active = SERVICE_CATALOG.find((g) => g.category === tab)!;
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return active.services;
    return active.services.filter((s) => s.title.toLowerCase().includes(q) || s.code.toLowerCase().includes(q));
  }, [active, query]);

  function addService(group: CatalogGroup, service: CatalogService) {
    setCart((prev) => {
      const key = `${group.category}:${service.code}`;
      const existing = prev.find((i) => i.key === key);
      if (existing) return prev.map((i) => (i.key === key ? { ...i, qty: i.qty + 1 } : i));
      return [...prev, { key, group, service, qty: 1 }];
    });
  }
  function updateQty(key: string, delta: number) {
    setCart((prev) => prev.map((i) => (i.key === key ? { ...i, qty: Math.max(0, i.qty + delta) } : i)).filter((i) => i.qty > 0));
  }

  const total = cart.reduce((sum, i) => sum + i.service.priceCents * i.qty, 0);

  function openSaveDialog() {
    if (!editingId) setForm({ title: "", client_name: "", notes: "", status: "rascunho" });
    setSaveOpen(true);
  }

  async function saveQuote() {
    if (!user) return;
    if (!form.title.trim()) {
      Alert.alert("Campo obrigatório", "Informe um título para o orçamento");
      return;
    }
    setSaving(true);
    const payload = {
      owner_id: user.id,
      title: form.title.trim(),
      client_name: form.client_name.trim() || null,
      notes: form.notes.trim() || null,
      items: toSavedItems(cart) as unknown as never,
      total_cents: total,
      status: form.status,
    };
    const { error } = editingId
      ? await supabase.from("quotes").update(payload).eq("id", editingId)
      : await supabase.from("quotes").insert(payload);
    setSaving(false);
    if (error) {
      Alert.alert("Erro ao salvar", error.message);
      return;
    }
    setSaveOpen(false);
    await loadQuotes();
  }

  function openQuote(q: QuoteRow) {
    setCart(fromSavedItems(q.items));
    setEditingId(q.id);
    setForm({ title: q.title, client_name: q.client_name ?? "", notes: q.notes ?? "", status: q.status });
  }

  async function deleteQuote(id: string) {
    const { error } = await supabase.from("quotes").delete().eq("id", id);
    if (error) {
      Alert.alert("Erro", "Erro ao excluir orçamento");
      return;
    }
    if (editingId === id) resetEditing();
    await loadQuotes();
  }

  function resetEditing() {
    setEditingId(null);
    setCart([]);
    setForm({ title: "", client_name: "", notes: "", status: "rascunho" });
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      <Stack.Screen options={{ title: "Financeiro" }} />

      {/* Carteira */}
      <View style={styles.wallet}>
        <Text style={styles.walletLabel}>SALDO DISPONÍVEL</Text>
        <Text style={styles.walletValue}>R$ 0,00</Text>
        <View style={{ flexDirection: "row", gap: 8, marginTop: 14 }}>
          <View style={{ flex: 1 }}>
            <AppButton label="Sacar via PIX" onPress={() => Alert.alert("PIX", "Em breve.")} />
          </View>
          <View style={{ flex: 1 }}>
            <AppButton label="Extrato completo" variant="outline" onPress={() => Alert.alert("Extrato", "Em breve.")} />
          </View>
        </View>
      </View>

      {/* Movimentação */}
      <Text style={styles.sectionTitle}>Movimentação recente</Text>
      <View style={{ gap: 8 }}>
        {[
          { label: "Recebimento — Atendimento", value: "+ R$ 0,00", tone: "success" as const },
          { label: "Saque PIX", value: "- R$ 0,00", tone: "danger" as const },
          { label: "Comissão ZELAR+", value: "- R$ 0,00", tone: "muted" as const },
        ].map((m) => (
          <Card key={m.label} style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={styles.moveLabel}>{m.label}</Text>
              <Text style={styles.moveSub}>Aguardando dados reais</Text>
            </View>
            <Text
              style={[
                styles.moveValue,
                m.tone === "success" && { color: colors.success },
                m.tone === "danger" && { color: colors.danger },
                m.tone === "muted" && { color: colors.textMuted },
              ]}
            >
              {m.value}
            </Text>
          </Card>
        ))}
      </View>

      {/* Tabela de honorários */}
      <Text style={styles.sectionTitle}>Tabela de referência de honorários</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
        {SERVICE_CATALOG.map((g) => (
          <Pressable key={g.category} onPress={() => setTab(g.category)} style={[styles.tab, tab === g.category && styles.tabActive]}>
            <Text style={[styles.tabText, tab === g.category && styles.tabTextActive]}>{g.label}</Text>
          </Pressable>
        ))}
      </ScrollView>

      <Card style={{ marginTop: 12 }}>
        <Text style={styles.sourceLabel}>Fonte oficial</Text>
        <Text style={styles.sourceText}>{active.source}</Text>
      </Card>

      <TextInput
        style={[styles.input, { marginTop: 10 }]}
        value={query}
        onChangeText={setQuery}
        placeholder="Buscar serviço"
        placeholderTextColor={colors.textMuted}
      />

      <View style={{ marginTop: 10, gap: 8 }}>
        {filtered.map((s) => (
          <Pressable key={s.code} onPress={() => addService(active, s)}>
            <Card>
              <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 10 }}>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={styles.svcTitle}>{s.title}</Text>
                  <View style={{ flexDirection: "row", gap: 6, marginTop: 4, alignItems: "center" }}>
                    <Badge label={s.unit} tone="muted" />
                    <Text style={styles.svcCode}>{s.code}</Text>
                  </View>
                  {s.note && <Text style={styles.svcNote}>{s.note}</Text>}
                </View>
                <Text style={[styles.svcPrice, s.priceCents === 0 && { color: colors.textMuted }]}>
                  {s.priceCents > 0 ? formatBRL(s.priceCents) : "Sob consulta"}
                </Text>
              </View>
            </Card>
          </Pressable>
        ))}
        {filtered.length === 0 && (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>Nenhum serviço encontrado.</Text>
          </View>
        )}
      </View>

      {/* Carrinho / orçamento em edição */}
      {cart.length > 0 && (
        <Card style={{ marginTop: 22 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={styles.cartTitle}>{editingId ? "Editando orçamento" : "Novo orçamento"}</Text>
              {editingId && (
                <Text style={styles.cartSub} numberOfLines={1}>
                  {form.title}
                </Text>
              )}
            </View>
            <Pressable onPress={resetEditing}>
              <Text style={styles.clearLink}>Limpar</Text>
            </Pressable>
          </View>

          <View style={{ marginTop: 10, gap: 10 }}>
            {cart.map((i) => (
              <View key={i.key} style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={styles.cartItemTitle} numberOfLines={1}>
                    {i.service.title}
                  </Text>
                  <Text style={styles.cartItemSub}>
                    {i.group.label} · {formatBRL(i.service.priceCents)} / {i.service.unit}
                  </Text>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                  <Pressable style={styles.qtyBtn} onPress={() => updateQty(i.key, -1)}>
                    <Text style={styles.qtyBtnText}>−</Text>
                  </Pressable>
                  <Text style={styles.qtyValue}>{i.qty}</Text>
                  <Pressable style={styles.qtyBtn} onPress={() => updateQty(i.key, 1)}>
                    <Text style={styles.qtyBtnText}>+</Text>
                  </Pressable>
                </View>
                <Text style={styles.cartItemTotal}>{formatBRL(i.service.priceCents * i.qty)}</Text>
              </View>
            ))}
          </View>

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total estimado</Text>
            <Text style={styles.totalValue}>{formatBRL(total)}</Text>
          </View>
          <Text style={styles.disclaimer}>
            Valores de referência das tabelas oficiais. Ajuste conforme convênio, deslocamento e complexidade do caso.
          </Text>
          <View style={{ marginTop: 10 }}>
            <AppButton label={editingId ? "Salvar alterações" : "Salvar orçamento"} onPress={openSaveDialog} />
          </View>
        </Card>
      )}

      {/* Orçamentos salvos */}
      <Text style={styles.sectionTitle}>Orçamentos salvos</Text>
      {loadingQuotes ? (
        <LoadingState />
      ) : quotes.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>
            Nenhum orçamento salvo ainda. Toque em um serviço acima e depois em "Salvar orçamento".
          </Text>
        </View>
      ) : (
        <View style={{ gap: 8 }}>
          {quotes.map((q) => (
            <Card key={q.id} style={editingId === q.id ? { borderColor: colors.primary } : undefined}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 10 }}>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={styles.quoteTitle} numberOfLines={1}>
                    {q.title}
                  </Text>
                  <View style={{ flexDirection: "row", gap: 6, marginTop: 4, alignItems: "center", flexWrap: "wrap" }}>
                    <Badge label={STATUS_LABEL[q.status]} tone={q.status === "aprovado" ? "success" : q.status === "recusado" ? "danger" : "muted"} />
                    {q.client_name && <Text style={styles.quoteMeta}>{q.client_name}</Text>}
                    <Text style={styles.quoteMeta}>
                      {new Date(q.updated_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit" })}
                    </Text>
                  </View>
                </View>
                <Text style={styles.quotePrice}>{formatBRL(q.total_cents)}</Text>
              </View>
              <View style={{ flexDirection: "row", gap: 8, marginTop: 10 }}>
                <View style={{ flex: 1 }}>
                  <AppButton label="Reabrir e editar" variant="outline" onPress={() => openQuote(q)} />
                </View>
                <Pressable
                  style={styles.deleteBtn}
                  onPress={() =>
                    Alert.alert("Excluir orçamento", "Tem certeza?", [
                      { text: "Cancelar", style: "cancel" },
                      { text: "Excluir", style: "destructive", onPress: () => void deleteQuote(q.id) },
                    ])
                  }
                >
                  <Text style={{ color: colors.danger, fontWeight: "700" }}>✕</Text>
                </Pressable>
              </View>
            </Card>
          ))}
        </View>
      )}

      {/* Modal salvar orçamento */}
      <Modal visible={saveOpen} animationType="slide" transparent onRequestClose={() => setSaveOpen(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            <ScrollView keyboardShouldPersistTaps="handled">
              <Text style={styles.modalTitle}>{editingId ? "Editar orçamento" : "Salvar orçamento"}</Text>

              <Text style={styles.fieldLabel}>Título</Text>
              <TextInput
                style={styles.input}
                value={form.title}
                onChangeText={(v) => setForm((f) => ({ ...f, title: v }))}
                placeholder="Ex.: Pacote home care — junho"
                placeholderTextColor={colors.textMuted}
              />

              <Text style={[styles.fieldLabel, { marginTop: 12 }]}>Cliente / paciente</Text>
              <TextInput
                style={styles.input}
                value={form.client_name}
                onChangeText={(v) => setForm((f) => ({ ...f, client_name: v }))}
                placeholder="Nome do cliente"
                placeholderTextColor={colors.textMuted}
              />

              <Text style={[styles.fieldLabel, { marginTop: 12 }]}>Situação</Text>
              <View style={{ flexDirection: "row", gap: 6, flexWrap: "wrap" }}>
                {(Object.keys(STATUS_LABEL) as QuoteStatus[]).map((s) => (
                  <Pressable
                    key={s}
                    onPress={() => setForm((f) => ({ ...f, status: s }))}
                    style={[styles.statusChip, form.status === s && styles.statusChipActive]}
                  >
                    <Text style={[styles.statusChipText, form.status === s && styles.statusChipTextActive]}>{STATUS_LABEL[s]}</Text>
                  </Pressable>
                ))}
              </View>

              <Text style={[styles.fieldLabel, { marginTop: 12 }]}>Observações</Text>
              <TextInput
                style={[styles.input, { height: 70, textAlignVertical: "top" }]}
                value={form.notes}
                onChangeText={(v) => setForm((f) => ({ ...f, notes: v }))}
                multiline
                placeholder="Condições, deslocamento, prazo de validade…"
                placeholderTextColor={colors.textMuted}
              />

              <View style={styles.summaryBox}>
                <Text style={styles.summaryText}>
                  {cart.length} {cart.length === 1 ? "serviço" : "serviços"}
                </Text>
                <Text style={styles.summaryTotal}>{formatBRL(total)}</Text>
              </View>

              <View style={{ marginTop: 14 }}>
                <AppButton label={saving ? "Salvando..." : "Salvar"} onPress={() => void saveQuote()} disabled={saving} />
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.card },
  wallet: { borderRadius: 24, padding: 20, backgroundColor: colors.primary },
  walletLabel: { color: "#FFFFFFCC", fontSize: 11, fontWeight: "700", letterSpacing: 0.6 },
  walletValue: { color: colors.textInverse, fontSize: 30, fontWeight: "800", marginTop: 4 },
  sectionTitle: { fontSize: 12, fontWeight: "800", letterSpacing: 0.6, textTransform: "uppercase", color: colors.textMuted, marginTop: 22, marginBottom: 10 },
  moveLabel: { fontSize: 13.5, fontWeight: "600", color: colors.text },
  moveSub: { fontSize: 11, color: colors.textMuted, marginTop: 1 },
  moveValue: { fontSize: 13.5, fontWeight: "700", color: colors.text },
  tab: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, backgroundColor: colors.surfaceAlt },
  tabActive: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  tabText: { fontSize: 12, color: colors.textMuted, fontWeight: "600" },
  tabTextActive: { color: colors.text },
  sourceLabel: { fontSize: 12, fontWeight: "700", color: colors.text },
  sourceText: { fontSize: 11.5, color: colors.textMuted, marginTop: 2 },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.text,
  },
  svcTitle: { fontSize: 13.5, fontWeight: "600", color: colors.text },
  svcCode: { fontSize: 10.5, color: colors.textMuted, fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace" },
  svcNote: { fontSize: 11, color: colors.textMuted, marginTop: 4, lineHeight: 15 },
  svcPrice: { fontSize: 13.5, fontWeight: "700", color: colors.text },
  emptyBox: { borderWidth: 1, borderStyle: "dashed", borderColor: colors.border, borderRadius: 16, padding: 20, alignItems: "center" },
  emptyText: { color: colors.textMuted, fontSize: 12.5, textAlign: "center" },
  cartTitle: { fontSize: 14, fontWeight: "700", color: colors.text },
  cartSub: { fontSize: 11, color: colors.textMuted, marginTop: 2 },
  clearLink: { fontSize: 12, color: colors.textMuted },
  cartItemTitle: { fontSize: 13, fontWeight: "600", color: colors.text },
  cartItemSub: { fontSize: 10.5, color: colors.textMuted, marginTop: 1 },
  qtyBtn: { width: 26, height: 26, borderRadius: 8, borderWidth: 1, borderColor: colors.border, alignItems: "center", justifyContent: "center" },
  qtyBtnText: { fontSize: 15, fontWeight: "700", color: colors.text },
  qtyValue: { width: 20, textAlign: "center", fontSize: 13, fontWeight: "600", color: colors.text },
  cartItemTotal: { width: 76, textAlign: "right", fontSize: 13, fontWeight: "700", color: colors.text },
  totalRow: { flexDirection: "row", justifyContent: "space-between", borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 10, marginTop: 12 },
  totalLabel: { fontSize: 13, color: colors.textMuted },
  totalValue: { fontSize: 17, fontWeight: "800", color: colors.primary },
  disclaimer: { fontSize: 10.5, color: colors.textMuted, marginTop: 6, lineHeight: 15 },
  quoteTitle: { fontSize: 13.5, fontWeight: "600", color: colors.text },
  quoteMeta: { fontSize: 10.5, color: colors.textMuted },
  quotePrice: { fontSize: 13.5, fontWeight: "700", color: colors.primary },
  deleteBtn: { width: 40, alignItems: "center", justifyContent: "center", borderRadius: 10, borderWidth: 1, borderColor: colors.border },
  modalBackdrop: { flex: 1, backgroundColor: "#00000066", justifyContent: "flex-end" },
  modalSheet: { backgroundColor: colors.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: "88%" },
  modalTitle: { fontSize: 18, fontWeight: "800", color: colors.text },
  fieldLabel: { fontSize: 12, fontWeight: "700", color: colors.textMuted, marginBottom: 6 },
  statusChip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 10, borderWidth: 1, borderColor: colors.border },
  statusChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  statusChipText: { fontSize: 12, color: colors.text, fontWeight: "600" },
  statusChipTextActive: { color: colors.textInverse },
  summaryBox: { flexDirection: "row", justifyContent: "space-between", backgroundColor: colors.surfaceAlt, borderRadius: 12, padding: 12, marginTop: 14 },
  summaryText: { fontSize: 13, color: colors.textMuted },
  summaryTotal: { fontSize: 14, fontWeight: "800", color: colors.primary },
});
