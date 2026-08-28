// Componente de cartão de métrica, usado pelos dashboards executivo e
// profissional (equivalente visual simplificado aos cards de
// dashboard-executivo.tsx / dashboard-profissional.tsx do projeto original).
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { colors } from "@/theme/colors";

interface MetricCardProps {
  label: string;
  value: number | string | null | undefined;
  loading?: boolean;
  hint?: string;
}

export function MetricCard({ label, value, loading, hint }: MetricCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>{label}</Text>
      {loading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: 10 }} />
      ) : (
        <Text style={styles.value}>{value ?? "—"}</Text>
      )}
      {hint && <Text style={styles.hint}>{hint}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "47%",
    backgroundColor: "#F5F7FA",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  label: { fontSize: 12, fontWeight: "700", color: colors.textMuted, textTransform: "uppercase" },
  value: { fontSize: 26, fontWeight: "800", color: colors.text, marginTop: 8 },
  hint: { fontSize: 11, color: colors.textMuted, marginTop: 4 },
});
