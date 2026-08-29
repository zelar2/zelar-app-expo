// Porta fiel de src/routes/_authenticated/admin.tsx (o original também é
// só uma tela de abertura protegida por papel — comportamento idêntico).
import { ScrollView, StyleSheet, Text } from "react-native";

import { RoleGuard } from "@/components/RoleGuard";
import { colors } from "@/theme/colors";

export default function AdminScreen() {
  return (
    <RoleGuard allowedRoles={["admin"]}>
      <ScrollView style={{ flex: 1, backgroundColor: colors.card }} contentContainerStyle={styles.container}>
        <Text style={styles.title}>Painel Administrativo ZELAR+</Text>
        <Text style={styles.subtitle}>Área restrita para administradores.</Text>
      </ScrollView>
    </RoleGuard>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24 },
  title: { fontSize: 22, fontWeight: "800", color: colors.text },
  subtitle: { fontSize: 14, color: colors.textMuted, marginTop: 8 },
});
