// Porta de src/components/guards/RoleGuard.tsx: bloqueia o conteúdo se o
// papel do usuário não estiver na lista permitida (mesma lógica do original).
import type { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";

import { useAuth } from "@/context/auth-context";
import { colors } from "@/theme/colors";

interface RoleGuardProps {
  allowedRoles: string[];
  children: ReactNode;
}

export function RoleGuard({ allowedRoles, children }: RoleGuardProps) {
  const { role } = useAuth();
  const allowed = allowedRoles.map((r) => r.toLowerCase());

  if (!role || !allowed.includes(role.toLowerCase())) {
    return (
      <View style={styles.blocked}>
        <Text style={styles.blockedTitle}>Acesso restrito</Text>
        <Text style={styles.blockedText}>
          Você não tem permissão para acessar esta área.
        </Text>
      </View>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  blocked: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  blockedTitle: { fontSize: 18, fontWeight: "800", color: colors.text, marginBottom: 8 },
  blockedText: { fontSize: 14, color: colors.textMuted, textAlign: "center" },
});
