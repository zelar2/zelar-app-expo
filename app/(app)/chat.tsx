// Porta completa de src/routes/_authenticated/chat.tsx: lista de conversas
// do usuário (via `conversation_participants`/`conversations`) com busca e
// criação de nova conversa, e visualização de uma conversa com mensagens em
// tempo real (Supabase Realtime), igual ao original.
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Stack } from "expo-router";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/auth-context";
import { colors } from "@/theme/colors";
import { InitialsAvatar } from "@/components/ui/Kit";

interface Conversation {
  id: string;
  title: string | null;
  last_message_at: string | null;
  created_at: string;
}

interface Participant {
  user_id: string;
  full_name: string | null;
}

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
}

function titleFor(c: Conversation, parts: Participant[] | undefined, me: string | undefined) {
  if (c.title) return c.title;
  const others = (parts ?? []).filter((p) => p.user_id !== me);
  if (others.length === 0) return "Você";
  return others.map((p) => p.full_name ?? "Usuário").join(", ");
}

function relativeTime(d: Date) {
  const diff = Date.now() - d.getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "agora";
  if (min < 60) return `${min}m`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h}h`;
  const days = Math.floor(h / 24);
  if (days < 7) return `${days}d`;
  return d.toLocaleDateString("pt-BR");
}

export default function ChatScreen() {
  const { user, loading: authLoading } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [participantsByConv, setParticipantsByConv] = useState<Record<string, Participant[]>>({});
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [newDialog, setNewDialog] = useState(false);

  const userId = user?.id;

  const load = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    const { data: mine, error: mineErr } = await supabase
      .from("conversation_participants")
      .select("conversation_id")
      .eq("user_id", userId);
    if (mineErr) {
      setLoading(false);
      return;
    }
    const ids = (mine ?? []).map(
        (r: { conversation_id: string }) => r.conversation_id
      );
    if (ids.length === 0) {
      setConversations([]);
      setParticipantsByConv({});
      setLoading(false);
      return;
    }
    const { data: convs } = await supabase
      .from("conversations")
      .select("*")
      .in("id", ids)
      .order("last_message_at", { ascending: false, nullsFirst: false });
    setConversations((convs as Conversation[] | null) ?? []);

    const { data: parts } = await supabase
      .from("conversation_participants")
      .select("conversation_id, user_id, profiles:profiles!inner(full_name)")
      .in("conversation_id", ids);
    const map: Record<string, Participant[]> = {};
    ((parts as Array<{
        conversation_id: string;
        user_id: string;
        profiles?: { full_name?: string | null } | null;
      }> | null) ?? []).forEach((p) => {
      (map[p.conversation_id] ??= []).push({
        user_id: p.user_id,
        full_name: p.profiles?.full_name ?? null,
      });
    });
    setParticipantsByConv(map);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    if (!authLoading) void load();
  }, [authLoading, load]);

  const loadRef = useRef(load);
  useEffect(() => {
    loadRef.current = load;
  }, [load]);

  useEffect(() => {
    if (!userId) return;
    const channel = supabase
      .channel("chat-list")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, () => {
        void loadRef.current();
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const filtered = useMemo(() => {
    if (!query.trim()) return conversations;
    const q = query.toLowerCase();
    return conversations.filter((c) =>
      titleFor(c, participantsByConv[c.id], userId).toLowerCase().includes(q),
    );
  }, [conversations, participantsByConv, query, userId]);

  if (selectedId) {
    return (
      <ConversationView
        conversationId={selectedId}
        currentUserId={userId}
        participants={participantsByConv[selectedId] ?? []}
        onBack={() => setSelectedId(null)}
      />
    );
  }

  return (
    <View style={styles.screen}>
      <Stack.Screen
        options={{
          title: "Mensagens",
          headerRight: () => (
            <Pressable onPress={() => setNewDialog(true)} style={styles.newButton}>
              <Text style={styles.newButtonText}>+ Nova</Text>
            </Pressable>
          ),
        }}
      />

      <View style={styles.container}>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Buscar conversas"
          placeholderTextColor={colors.textMuted}
          style={styles.search}
        />

        {loading ? (
          <ActivityIndicator style={{ marginTop: 40 }} color={colors.primary} />
        ) : filtered.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>Nenhuma conversa ainda.</Text>
            <Pressable style={styles.emptyButton} onPress={() => setNewDialog(true)}>
              <Text style={styles.emptyButtonText}>+ Iniciar conversa</Text>
            </Pressable>
          </View>
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={(c) => c.id}
            contentContainerStyle={{ paddingTop: 12, paddingBottom: 24 }}
            renderItem={({ item: c }) => {
              const name = titleFor(c, participantsByConv[c.id], userId);
              const when = c.last_message_at
                ? relativeTime(new Date(c.last_message_at))
                : relativeTime(new Date(c.created_at));
              return (
                <Pressable style={styles.convRow} onPress={() => setSelectedId(c.id)}>
                  <InitialsAvatar name={name} size={48} />
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                      <Text style={styles.convName} numberOfLines={1}>
                        {name}
                      </Text>
                      <Text style={styles.convWhen}>{when}</Text>
                    </View>
                    <Text style={styles.convSub}>Toque para abrir</Text>
                  </View>
                </Pressable>
              );
            }}
          />
        )}
      </View>

      <NewConversationModal
        open={newDialog}
        onClose={() => setNewDialog(false)}
        currentUserId={userId}
        onCreated={async (id) => {
          setNewDialog(false);
          await load();
          setSelectedId(id);
        }}
      />
    </View>
  );
}

function ConversationView({
  conversationId,
  currentUserId,
  participants,
  onBack,
}: {
  conversationId: string;
  currentUserId?: string;
  participants: Participant[];
  onBack: () => void;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const listRef = useRef<FlatList<Message>>(null);

  const otherName = useMemo(() => {
    const others = participants.filter((p) => p.user_id !== currentUserId);
    if (others.length === 0) return "Conversa";
    return others.map((p) => p.full_name ?? "Usuário").join(", ");
  }, [participants, currentUserId]);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });
    setMessages((data as Message[] | null) ?? []);
    setLoading(false);
  }, [conversationId]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${conversationId}` },
        (payload) => {
          setMessages((prev) => {
            const m = payload.new as Message;
            if (prev.some((x) => x.id === m.id)) return prev;
            return [...prev, m];
          });
          setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 30);
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId]);

  const send = async () => {
    if (!currentUserId || !text.trim()) return;
    setSending(true);
    const content = text.trim();
    setText("");
    const { error } = await supabase.from("messages").insert({
      conversation_id: conversationId,
      sender_id: currentUserId,
      content,
    });
    setSending(false);
    if (error) setText(content);
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={90}
    >
      <Stack.Screen
        options={{
          title: otherName,
          headerLeft: () => (
            <Pressable onPress={onBack} style={{ paddingHorizontal: 4 }}>
              <Text style={{ color: colors.textInverse, fontSize: 20 }}>‹</Text>
            </Pressable>
          ),
        }}
      />

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={colors.primary} />
      ) : messages.length === 0 ? (
        <Text style={styles.firstMsgHint}>Envie a primeira mensagem 👋</Text>
      ) : (
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(m) => m.id}
          contentContainerStyle={{ padding: 16, gap: 8 }}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
          renderItem={({ item: m }) => {
            const mine = m.sender_id === currentUserId;
            return (
              <View style={[styles.bubbleRow, { justifyContent: mine ? "flex-end" : "flex-start" }]}>
                <View style={[styles.bubble, mine ? styles.bubbleMine : styles.bubbleTheirs]}>
                  <Text style={mine ? styles.bubbleTextMine : styles.bubbleTextTheirs}>{m.content}</Text>
                  <Text style={[styles.bubbleTime, mine && { color: "rgba(255,255,255,0.7)" }]}>
                    {new Date(m.created_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                  </Text>
                </View>
              </View>
            );
          }}
        />
      )}

      <View style={styles.inputBar}>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Mensagem"
          placeholderTextColor={colors.textMuted}
          style={styles.input}
          multiline
        />
        <Pressable
          style={[styles.sendButton, (sending || !text.trim()) && { opacity: 0.5 }]}
          onPress={send}
          disabled={sending || !text.trim()}
        >
          <Text style={styles.sendButtonText}>{sending ? "..." : "Enviar"}</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

function NewConversationModal({
  open,
  onClose,
  currentUserId,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  currentUserId?: string;
  onCreated: (id: string) => void | Promise<void>;
}) {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<{ id: string; full_name: string | null }[]>([]);
  const [searching, setSearching] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!open) {
      setSearch("");
      setResults([]);
    }
  }, [open]);

  useEffect(() => {
    if (!search.trim() || !currentUserId) {
      setResults([]);
      return;
    }
    const q = search.trim();
    const timer = setTimeout(async () => {
      setSearching(true);
      const { data } = await supabase
        .from("profiles")
        .select("id, full_name")
        .ilike("full_name", `%${q}%`)
        .neq("id", currentUserId)
        .limit(10);
      setResults((data as { id: string; full_name: string | null }[] | null) ?? []);
      setSearching(false);
    }, 250);
    return () => clearTimeout(timer);
  }, [search, currentUserId]);

  const start = async (otherId: string) => {
    if (!currentUserId) return;
    setCreating(true);
    const { data, error } = await supabase.rpc("start_direct_conversation", { _other_id: otherId });
    setCreating(false);
    if (error || !data) return;
    await onCreated(data as string);
  };

  return (
    <Modal visible={open} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>Nova conversa</Text>
          <TextInput
            autoFocus
            value={search}
            onChangeText={setSearch}
            placeholder="Nome do paciente ou profissional"
            placeholderTextColor={colors.textMuted}
            style={styles.search}
          />
          <View style={{ maxHeight: 280, marginTop: 10 }}>
            {searching && <ActivityIndicator color={colors.primary} />}
            {!searching && search && results.length === 0 && (
              <Text style={{ textAlign: "center", color: colors.textMuted, fontSize: 13 }}>
                Nenhum resultado
              </Text>
            )}
            <FlatList
              data={results}
              keyExtractor={(r) => r.id}
              renderItem={({ item: r }) => (
                <Pressable disabled={creating} style={styles.resultRow} onPress={() => start(r.id)}>
                  <InitialsAvatar name={r.full_name ?? "?"} size={36} />
                  <Text style={styles.resultName}>{r.full_name ?? "Sem nome"}</Text>
                </Pressable>
              )}
            />
          </View>
          <Pressable style={styles.modalClose} onPress={onClose}>
            <Text style={styles.modalCloseText}>Fechar</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.card },
  container: { flex: 1, padding: 16 },
  search: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.text,
    backgroundColor: colors.card,
  },
  newButton: { paddingHorizontal: 8 },
  newButtonText: { color: colors.textInverse, fontWeight: "700", fontSize: 13 },
  empty: { alignItems: "center", paddingTop: 60 },
  emptyText: { color: colors.textMuted, fontSize: 13.5 },
  emptyButton: { marginTop: 12, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10, backgroundColor: colors.primary + "1A" },
  emptyButtonText: { color: colors.primary, fontWeight: "700", fontSize: 13 },
  convRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    padding: 12,
    marginBottom: 8,
  },
  convName: { fontSize: 14.5, fontWeight: "700", color: colors.text, flexShrink: 1 },
  convWhen: { fontSize: 10, color: colors.textMuted },
  convSub: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  firstMsgHint: { textAlign: "center", color: colors.textMuted, marginTop: 40, fontSize: 13.5 },
  bubbleRow: { flexDirection: "row" },
  bubble: { maxWidth: "80%", borderRadius: 16, paddingHorizontal: 14, paddingVertical: 8 },
  bubbleMine: { backgroundColor: colors.primary },
  bubbleTheirs: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  bubbleTextMine: { color: colors.textInverse, fontSize: 14 },
  bubbleTextTheirs: { color: colors.text, fontSize: 14 },
  bubbleTime: { fontSize: 10, color: colors.textMuted, marginTop: 2 },
  inputBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.card,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.text,
    maxHeight: 100,
  },
  sendButton: { backgroundColor: colors.primary, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 12 },
  sendButtonText: { color: colors.textInverse, fontWeight: "700", fontSize: 13 },
  modalBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" },
  modalCard: { backgroundColor: colors.card, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: "80%" },
  modalTitle: { fontSize: 17, fontWeight: "800", color: colors.text, marginBottom: 12 },
  resultRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.border },
  resultName: { fontSize: 14, fontWeight: "600", color: colors.text },
  modalClose: { marginTop: 14, alignItems: "center", paddingVertical: 12 },
  modalCloseText: { color: colors.textMuted, fontWeight: "700" },
});
