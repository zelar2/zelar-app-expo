// Assistente IA — porta fiel de src/routes/_authenticated/assistente-ia.tsx.
// Igual ao original: interface completa de chat com sugestões rápidas.
// As respostas são geradas localmente (mesma lógica do web, que também
// opera em "modo demonstração" até uma API de IA real ser conectada em
// Configurações > Integrações).
import { useState } from "react";
import { FlatList, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, View } from "react-native";

import { colors } from "@/theme/colors";
import { AppButton, Card, TextField } from "@/components/ui/Kit";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const SUGGESTIONS = [
  "Protocolo de curativo em ferida diabética",
  "Sinais de alerta para sepse em idosos",
  "Como documentar evolução de enfermagem",
  "Cálculo de gotejamento de soro",
  "Orientações pós-alta para cuidador",
];

const WELCOME =
  "Olá! Sou o assistente inteligente do ZELAR+. Posso ajudar com protocolos clínicos, orientações de documentação, cálculos e suporte operacional. O que você precisa?";

function generateResponse(query: string): string {
  const q = query.toLowerCase();
  if (q.includes("curativo") || q.includes("ferida"))
    return "Para curativo em ferida diabética: 1) Lavar com soro fisiológico; 2) Desbridamento quando indicado; 3) Aplicar hidrogel ou alginato conforme exsudato; 4) Cobertura secundária adequada; 5) Avaliar sinais de infecção a cada troca.";
  if (q.includes("sepse") || q.includes("sinais"))
    return "Sinais de alerta para sepse em idosos: febre ou hipotermia, taquicardia, taquipneia, alteração do nível de consciência, hipotensão, oligúria, glicemia alterada. Encaminhe ao pronto-socorro imediatamente.";
  if (q.includes("documentar") || q.includes("evolução"))
    return "A evolução de enfermagem deve conter: data/hora, estado geral do paciente, sinais vitais, cuidados realizados, resposta às intervenções, intercorrências e assinatura do profissional.";
  if (q.includes("gotejamento") || q.includes("soro"))
    return "Fórmula: Gotas/min = (Volume em ml × Fator de gotejamento) / Tempo em minutos. Fator padrão: 20 gtt/ml (macro) ou 60 gtt/ml (micro).";
  if (q.includes("pós-alta") || q.includes("cuidador"))
    return "Orientações pós-alta: 1) Horários de medicação; 2) Sinais de alerta para retorno; 3) Cuidados com ferida/catéteres; 4) Hidratação e nutrição; 5) Contatos de emergência.";
  return "Entendi sua solicitação. No momento estou operando em modo de demonstração. Para respostas completas e atualizadas, conecte a API do assistente no painel de configurações do ZELAR+.";
}

export default function AssistenteIaScreen() {
  const [messages, setMessages] = useState<Message[]>([{ id: "welcome", role: "assistant", content: WELCOME, timestamp: new Date() }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  function send(text?: string) {
    const content = (text ?? input).trim();
    if (!content || loading) return;
    const userMsg: Message = { id: String(Date.now()), role: "user", content, timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    setTimeout(() => {
      setMessages((prev) => [...prev, { id: String(Date.now() + 1), role: "assistant", content: generateResponse(content), timestamp: new Date() }]);
      setLoading(false);
    }, 900);
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View style={styles.suggestions}>
        <FlatList
          horizontal
          data={SUGGESTIONS}
          keyExtractor={(s) => s}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8, paddingHorizontal: 16 }}
          renderItem={({ item }) => (
            <Pressable style={styles.chip} onPress={() => send(item)}>
              <Text style={styles.chipText}>{item}</Text>
            </Pressable>
          )}
        />
      </View>

      <FlatList
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, gap: 10 }}
        data={messages}
        keyExtractor={(m) => m.id}
        renderItem={({ item }) => (
          <View style={[styles.bubbleRow, item.role === "user" && { justifyContent: "flex-end" }]}>
            <Card style={[styles.bubble, item.role === "user" ? styles.bubbleUser : styles.bubbleAssistant]}>
              <Text style={item.role === "user" ? styles.bubbleTextUser : styles.bubbleTextAssistant}>{item.content}</Text>
            </Card>
          </View>
        )}
        ListFooterComponent={loading ? <Text style={styles.typing}>Assistente está digitando…</Text> : null}
      />

      <View style={styles.inputRow}>
        <View style={{ flex: 1 }}>
          <TextField value={input} onChangeText={setInput} placeholder="Digite sua pergunta clínica ou operacional…" />
        </View>
        <View style={{ width: 88, marginLeft: 8 }}>
          <AppButton label="Enviar" onPress={() => send()} disabled={loading || !input.trim()} />
        </View>
      </View>
      <Text style={styles.disclaimer}>
        As respostas são geradas por IA e têm caráter informativo. Não substituem avaliação médica ou prescrição.
      </Text>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.card },
  suggestions: { paddingTop: 12, paddingBottom: 4 },
  chip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card },
  chipText: { fontSize: 12, fontWeight: "600", color: colors.primary },
  bubbleRow: { flexDirection: "row" },
  bubble: { maxWidth: "82%" },
  bubbleUser: { backgroundColor: colors.primary, borderColor: colors.primary },
  bubbleAssistant: { backgroundColor: colors.card },
  bubbleTextUser: { color: colors.textInverse, fontSize: 13.5, lineHeight: 19 },
  bubbleTextAssistant: { color: colors.text, fontSize: 13.5, lineHeight: 19 },
  typing: { color: colors.textMuted, fontSize: 12, paddingLeft: 4 },
  inputRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingBottom: 8 },
  disclaimer: { fontSize: 10.5, color: colors.textMuted, paddingHorizontal: 16, paddingBottom: 14, lineHeight: 15 },
});
