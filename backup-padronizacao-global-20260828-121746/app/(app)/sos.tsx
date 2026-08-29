// Porta completa de src/routes/_authenticated/sos.tsx: botão de emergência
// (simulado, como no original) e atalhos para SAMU, compartilhar
// localização e contatos de emergência.
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Stack } from "expo-router";

import { colors } from "@/theme/colors";

const ACTIONS = [
  { label: "SAMU · 192", desc: "Emergência médica pública" },
  { label: "Compartilhar localização", desc: "Envia GPS para contatos" },
  { label: "Contatos de emergência", desc: "Configure em Perfil" },
];

export default function SosScreen() {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
      <Stack.Screen options={{ title: "SOS / Emergência" }} />

      <View style={styles.hero}>
        <View style={styles.heroIcon}>
          <Text style={styles.heroIconText}>🚨</Text>
        </View>
        <Text style={styles.heroTitle}>Precisa de ajuda urgente?</Text>
        <Text style={styles.heroSubtitle}>
          Ao acionar, seus contatos de emergência e a central ZELAR+ serão notificados com sua
          localização em tempo real.
        </Text>
        <Pressable
          style={({ pressed }) => [styles.sosButton, pressed && { opacity: 0.85 }]}
          onPress={() =>
            Alert.alert(
              "Simulação",
              "Em produção, isso acionaria a central ZELAR+ e o SAMU imediatamente.",
            )
          }
        >
          <Text style={styles.sosButtonText}>Acionar SOS agora</Text>
        </Pressable>
      </View>

      <View style={styles.list}>
        {ACTIONS.map((a) => (
          <View key={a.label} style={styles.actionRow}>
            <View style={styles.actionIcon}>
              <Text style={{ fontSize: 18 }}>•</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.actionLabel}>{a.label}</Text>
              <Text style={styles.actionDesc}>{a.desc}</Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.card },
  container: { padding: 16, paddingBottom: 32 },
  hero: {
    borderRadius: 24,
    backgroundColor: colors.danger,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  heroIcon: {
    height: 80,
    width: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  heroIconText: { fontSize: 36 },
  heroTitle: { fontSize: 19, fontWeight: "800", color: "#FFFFFF", textAlign: "center" },
  heroSubtitle: {
    marginTop: 6,
    fontSize: 13,
    color: "rgba(255,255,255,0.9)",
    textAlign: "center",
    lineHeight: 19,
  },
  sosButton: {
    marginTop: 20,
    height: 56,
    width: "100%",
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  sosButtonText: { fontSize: 17, fontWeight: "800", color: colors.danger },
  list: { marginTop: 16, gap: 8 },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    padding: 12,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  actionIcon: {
    height: 40,
    width: 40,
    borderRadius: 12,
    backgroundColor: colors.danger + "1A",
    alignItems: "center",
    justifyContent: "center",
  },
  actionLabel: { fontWeight: "700", color: colors.text, fontSize: 14 },
  actionDesc: { fontSize: 12, color: colors.textMuted, marginTop: 1 },
});
