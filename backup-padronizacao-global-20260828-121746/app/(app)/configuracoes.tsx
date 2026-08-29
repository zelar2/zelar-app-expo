// Configurações — atalhos reais para as áreas de configuração (segurança,
// notificações, integrações) + dados básicos da conta.
import { StyleSheet, Text, ScrollView } from "react-native";
import { useRouter } from "expo-router";

import { useAuth } from "@/context/auth-context";
import { colors } from "@/theme/colors";
import { Card } from "@/components/ui/Kit";

const LINKS: { to: string; label: string; description: string }[] = [
  { to: "/minha-conta", label: "Minha conta", description: "Nome, telefone, cidade e bio." },
  { to: "/seguranca", label: "Segurança", description: "Alterar senha da conta." },
  { to: "/notificacoes-tempo-real", label: "Notificações", description: "Preferências de push, e-mail e in-app." },
  { to: "/integracoes", label: "Integrações", description: "Chaves de mapas, pagamentos e IA." },
];

export default function ConfiguracoesScreen() {
  const { user } = useAuth();
  const router = useRouter();

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
      <Text style={styles.title}>Configurações</Text>
      <Text style={styles.subtitle}>{user?.email}</Text>

      {LINKS.map((l) => (
        <Card key={l.to} style={{ marginTop: 12 }} onPress={() => router.push(l.to as never)}>
          <Text style={styles.linkLabel}>{l.label}</Text>
          <Text style={styles.linkDescription}>{l.description}</Text>
        </Card>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.card },
  title: { fontSize: 20, fontWeight: "800", color: colors.text },
  subtitle: { fontSize: 13, color: colors.textMuted, marginTop: 4, marginBottom: 6 },
  linkLabel: { fontSize: 15, fontWeight: "700", color: colors.text },
  linkDescription: { fontSize: 12.5, color: colors.textMuted, marginTop: 3 },
});
