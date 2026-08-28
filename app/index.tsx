// Equivalente a src/routes/index.tsx: redireciona para /inicio (autenticado)
// ou /auth (não autenticado), assim que a sessão terminar de carregar.
import { Redirect } from "expo-router";
import { ActivityIndicator, View } from "react-native";

import { useAuth } from "@/context/auth-context";
import { colors } from "@/theme/colors";

export default function Index() {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background }}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return <Redirect href={session ? "/inicio" : "/auth"} />;
}
