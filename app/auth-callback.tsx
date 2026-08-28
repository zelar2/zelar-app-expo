// Porta de src/routes/auth.callback.tsx: tela de retorno do fluxo OAuth
// (Google), aguarda a sessão do Supabase ser detectada e redireciona.
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { Redirect } from "expo-router";

import { useAuth } from "@/context/auth-context";
import { colors } from "@/theme/colors";

export default function AuthCallback() {
  const { session, loading } = useAuth();

  if (!loading && session) {
    return <Redirect href="/inicio" />;
  }

  if (!loading && !session) {
    return <Redirect href="/auth" />;
  }

  return (
    <View style={styles.container}>
      <ActivityIndicator color={colors.primary} size="large" />
      <Text style={styles.text}>Concluindo login…</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background, gap: 12 },
  text: { color: colors.textInverse },
});
