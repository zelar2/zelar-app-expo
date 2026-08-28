// Chat com IA — porta fiel de src/routes/_authenticated/chat-ia.tsx
// (conversa livre, mesma lógica de respostas simuladas do web).
import { useState } from "react";
import { FlatList, KeyboardAvoidingView, Platform, StyleSheet, Text, View } from "react-native";

import { colors } from "@/theme/colors";
import { AppButton, Card, TextField } from "@/components/ui/Kit";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const WELCOME =
  "Olá! Sou a IA do ZELAR+. Estou aqui para ajudar com qualquer dúvida sobre o sistema, processos operacionais, ou para conversar sobre melhorias na sua operação de home care. Como posso ajudar?";

function simulateReply(query: string): string {
  const q = query.toLowerCase();
  if (q.includes("agenda") || q.includes("marcar"))
    return "Para agendar um atendimento, acesse a aba 'Agenda' no menu principal. Lá você pode criar atendimentos domiciliares, teleconsultas ou presenciais.";
  if (q.includes("chamada") || q.includes("solicitar"))
    return "Para solicitar uma chamada de atendimento, vá em 'Chamadas' e toque em '+'. Escolha o procedimento, informe o endereço e confirme.";
  if (q.includes("financeiro") || q.includes("pagar") || q.includes("receber"))
    return "No módulo Financeiro você consulta pagamentos, comissões e faturas. Profissionais podem acompanhar o saldo em 'Meus pagamentos'.";
  if (q.includes("documento") || q.includes("aprovação"))
    return "Os documentos dos profissionais são validados em 'Aprovações'. Profissionais devem manter COREN/CRM e outros registros atualizados.";
  if (q.includes("cliente") || q.includes("paciente"))
    return "A ficha do cliente está em 'Clientes'. Lá você cadastra dados, endereço, plano de cuidados e acompanha o histórico de atendimentos.";
  if (q.includes("sae") || q.includes("enfermagem"))
    return "O módulo de Enfermagem (SAE) permite sistematizar o cuidado: coleta de dados, diagnósticos, prescrições e evoluções.";
  if (q.includes("configuração") || q.includes("sistema"))
    return "As configurações do sistema estão em 'Configurações': segurança, notificações, e integrações (mapas, pagamentos, IA).";
  return "Interessante! No momento estou operando em modo demonstração com respostas simuladas. Para integração completa, configure a chave de API nas Configurações > Integrações.";
}

export default function ChatIaScreen() {
  const [messages, setMessages] = useState<Message[]>([{ id: "init", role: "assistant", content: WELCOME }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  function send() {
    const content = input.trim();
    if (!content || loading) return;
    setMessages((prev) => [...prev, { id: String(Date.now()), role: "user", content }]);
    setInput("");
    setLoading(true);
    setTimeout(() => {
      setMessages((prev) => [...prev, { id: String(Date.now() + 1), role: "assistant", content: simulateReply(content) }]);
      setLoading(false);
    }, 800);
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : undefined}>
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
        ListFooterComponent={loading ? <Text style={styles.typing}>IA está digitando…</Text> : null}
      />
      <View style={styles.inputRow}>
        <View style={{ flex: 1 }}>
          <TextField value={input} onChangeText={setInput} placeholder="Pergunte qualquer coisa sobre o ZELAR+…" />
        </View>
        <View style={{ width: 88, marginLeft: 8 }}>
          <AppButton label="Enviar" onPress={send} disabled={loading || !input.trim()} />
        </View>
      </View>
      <Text style={styles.disclaimer}>
        As respostas são informativas e não substituem orientação médica ou jurídica qualificada.
      </Text>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.card },
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
