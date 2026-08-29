// Porta de src/routes/_authenticated/perfil.tsx: dados do usuário logado
// (via useAuth, mesma fonte que o original) e ação de sair.
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { useAuth } from "@/context/auth-context";
import { colors } from "@/theme/colors";

export default function PerfilScreen() {
  const { user, role, roles, signOut } = useAuth();

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.card }} contentContainerStyle={styles.container}>
      <Text style={styles.title}>Meu perfil</Text>

      <View style={styles.field}>
        <Text style={styles.label}>E-mail</Text>
        <Text style={styles.value}>{user?.email ?? "—"}</Text>
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Papel principal</Text>
        <Text style={styles.value}>{role ?? "—"}</Text>
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Papéis atribuídos</Text>
        <Text style={styles.value}>{roles.length ? roles.join(", ") : "—"}</Text>
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>ID do usuário</Text>
        <Text style={styles.value}>{user?.id ?? "—"}</Text>
      </View>

      <Pressable style={styles.signOut} onPress={() => signOut()}>
        <Text style={styles.signOutText}>Sair da conta</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 32 },
  title: { fontSize: 20, fontWeight: "800", color: colors.text, marginBottom: 20 },
  field: { marginBottom: 16 },
  label: { fontSize: 12, fontWeight: "700", color: colors.textMuted, textTransform: "uppercase" },
  value: { fontSize: 15, color: colors.text, marginTop: 4 },
  signOut: {
    marginTop: 20,
    backgroundColor: "#FEE2E2",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  signOutText: { color: colors.danger, fontWeight: "700" },
});
