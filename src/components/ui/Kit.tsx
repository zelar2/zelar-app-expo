// Kit de UI nativo reutilizável — equivalentes simplificados dos componentes
// Radix/Tailwind de src/components/ui/* do projeto web, usados por
// GenericScreen/DetailScreen e pelas telas já customizadas (inicio, agenda,
// financeiro etc). Mantém a mesma paleta (src/theme/colors.ts).
import type { ReactNode } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { colors } from "@/theme/colors";

/* ── Card ───────────────────────────────────────────────────────────── */
export function Card({
  children,
  style,
  onPress,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
}) {
  const content = <View style={[styles.card, style]}>{children}</View>;
  if (!onPress) return content;
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [pressed && { opacity: 0.7 }]}>
      {content}
    </Pressable>
  );
}

/* ── Badge ──────────────────────────────────────────────────────────── */
type BadgeTone = "primary" | "success" | "warning" | "danger" | "muted";
const BADGE_TONES: Record<BadgeTone, { bg: string; fg: string }> = {
  primary: { bg: colors.primary + "1A", fg: colors.primary },
  success: { bg: colors.success + "1A", fg: colors.success },
  warning: { bg: colors.warning + "1A", fg: colors.warning },
  danger: { bg: colors.danger + "1A", fg: colors.danger },
  muted: { bg: colors.textMuted + "1A", fg: colors.textMuted },
};

export function Badge({ label, tone = "muted" }: { label: string; tone?: BadgeTone }) {
  const t = BADGE_TONES[tone];
  return (
    <View style={[styles.badge, { backgroundColor: t.bg }]}>
      <Text style={[styles.badgeText, { color: t.fg }]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

/** Deriva um tom de badge a partir de um valor de status textual comum
 * (mesma heurística de cores usada nas telas web: verde=concluído/ativo,
 * amarelo=pendente, vermelho=cancelado/inativo). */
export function toneForStatus(value: string | null | undefined): BadgeTone {
  const v = (value ?? "").toLowerCase();
  if (/(conclu|ativo|aprovad|pago|confirmad|sucesso)/.test(v)) return "success";
  if (/(pendente|aguardando|analise|processando)/.test(v)) return "warning";
  if (/(cancelad|inativo|rejeitad|recusad|erro|falha)/.test(v)) return "danger";
  return "muted";
}

/* ── Avatar (iniciais) ──────────────────────────────────────────────── */
export function InitialsAvatar({ name, size = 44 }: { name: string; size?: number }) {
  const initials =
    name
      .trim()
      .split(/\s+/)
      .map((s) => s[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "?";
  return (
    <View
      style={[
        styles.avatar,
        { width: size, height: size, borderRadius: size / 2 },
      ]}
    >
      <Text style={[styles.avatarText, { fontSize: size * 0.38 }]}>{initials}</Text>
    </View>
  );
}

/* ── SectionHeader ──────────────────────────────────────────────────── */
export function SectionHeader({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionHeaderText}>{title}</Text>
      {action}
    </View>
  );
}

/* ── SearchInput ────────────────────────────────────────────────────── */
export function SearchInput({
  value,
  onChangeText,
  placeholder = "Buscar...",
}: {
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={colors.textMuted}
      style={styles.search}
      autoCapitalize="none"
      autoCorrect={false}
    />
  );
}

/* ── StatCard (usado nos dashboards) ───────────────────────────────── */
export function StatCard({
  label,
  value,
  tone = "muted",
}: {
  label: string;
  value: string;
  tone?: BadgeTone;
}) {
  const t = BADGE_TONES[tone];
  return (
    <Card style={styles.statCard}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, { color: tone === "muted" ? colors.text : t.fg }]}>{value}</Text>
    </Card>
  );
}

/* ── Empty / Error / Loading states ────────────────────────────────── */
export function EmptyState({ message }: { message: string }) {
  return (
    <View style={styles.centerBox}>
      <Text style={styles.emptyText}>{message}</Text>
    </View>
  );
}

export function ErrorState({ message }: { message: string }) {
  return (
    <View style={styles.centerBox}>
      <Text style={styles.errorText}>Não foi possível carregar. {message}</Text>
    </View>
  );
}

export function LoadingState() {
  return (
    <View style={styles.centerBox}>
      <ActivityIndicator color={colors.primary} />
    </View>
  );
}

/* ── Button ─────────────────────────────────────────────────────────── */
export function AppButton({
  label,
  onPress,
  variant = "primary",
  disabled,
}: {
  label: string;
  onPress: () => void;
  variant?: "primary" | "outline";
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        variant === "outline" ? styles.buttonOutline : styles.buttonPrimary,
        (pressed || disabled) && { opacity: 0.7 },
      ]}
    >
      <Text style={variant === "outline" ? styles.buttonOutlineText : styles.buttonPrimaryText}>
        {label}
      </Text>
    </Pressable>
  );
}

/* ── Field (usado no DetailScreen) ─────────────────────────────────── */
export function Field({ label, value }: { label: string; value: ReactNode }) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Text style={styles.fieldValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  badgeText: { fontSize: 11, fontWeight: "700" },
  avatar: {
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: colors.textInverse, fontWeight: "800" },
  sectionHeader: {
    marginTop: 20,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionHeaderText: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.6,
    textTransform: "uppercase",
    color: colors.textMuted,
  },
  search: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.text,
    backgroundColor: colors.card,
  },
  statCard: { flex: 1, minWidth: 100 },
  statLabel: { fontSize: 11, color: colors.textMuted, fontWeight: "600" },
  statValue: { fontSize: 20, fontWeight: "800", marginTop: 4 },
  centerBox: { paddingVertical: 32, alignItems: "center", justifyContent: "center" },
  emptyText: { color: colors.textMuted, fontSize: 13.5, textAlign: "center" },
  errorText: { color: colors.danger, fontSize: 13.5, textAlign: "center" },
  button: {
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonPrimary: { backgroundColor: colors.primary },
  buttonPrimaryText: { color: colors.textInverse, fontWeight: "700", fontSize: 14 },
  buttonOutline: { borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card },
  buttonOutlineText: { color: colors.text, fontWeight: "700", fontSize: 14 },
  field: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: 10,
  },
  fieldLabel: {
    fontSize: 10.5,
    fontWeight: "700",
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  fieldValue: { fontSize: 14.5, color: colors.text, marginTop: 3 },

  // Form primitives
  formLabel: {
    fontSize: 11.5,
    fontWeight: "700",
    color: colors.textMuted,
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },

  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14.5,
    color: colors.text,
    backgroundColor: colors.card,
  },

  switchRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  switchTrack: {
    width: 44,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.border,
    padding: 3,
    justifyContent: "center",
  },

  switchThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
  },

  chip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },

  chipText: {
    fontSize: 12.5,
    fontWeight: "600",
    color: colors.text,
  },

  fab: {
    position: "absolute",
    right: 18,
    bottom: 22,
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },

  fabText: {
    color: colors.textInverse,
    fontSize: 26,
    fontWeight: "700",
    marginTop: -2,
  },
});

/* ── Form primitives (usados por CrudScreen/EntityForm) ───────────────── */
export function FormField({ label, required, children }: { label: string; required?: boolean; children: ReactNode }) {
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={styles.formLabel}>
        {label}
        {required ? <Text style={{ color: colors.danger }}> *</Text> : null}
      </Text>
      {children}
    </View>
  );
}

export function TextField({
  value,
  onChangeText,
  placeholder,
  multiline,
  keyboardType,
}: {
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  multiline?: boolean;
  keyboardType?: "default" | "numeric" | "email-address" | "phone-pad";
}) {
  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={colors.textMuted}
      multiline={multiline}
      keyboardType={keyboardType}
      style={[styles.input, multiline && { minHeight: 90, textAlignVertical: "top" }]}
    />
  );
}

export function SwitchField({ value, onValueChange }: { value: boolean; onValueChange: (v: boolean) => void }) {
  return (
    <Pressable onPress={() => onValueChange(!value)} style={styles.switchRow}>
      <View style={[styles.switchTrack, value && { backgroundColor: colors.primary }]}>
        <View style={[styles.switchThumb, value && { alignSelf: "flex-end" }]} />
      </View>
      <Text style={{ marginLeft: 10, color: colors.text, fontSize: 13.5 }}>{value ? "Sim" : "Não"}</Text>
    </Pressable>
  );
}

export function ChipSelect({
  value,
  options,
  onChange,
}: {
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
      {options.map((opt) => {
        const active = opt === value;
        return (
          <Pressable
            key={opt}
            onPress={() => onChange(opt)}
            style={[styles.chip, active && { backgroundColor: colors.primary, borderColor: colors.primary }]}
          >
            <Text style={[styles.chipText, active && { color: colors.textInverse }]}>{opt}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function FAB({ onPress, label = "+" }: { onPress: () => void; label?: string }) {
  return (
    <Pressable onPress={onPress} style={styles.fab}>
      <Text style={styles.fabText}>{label}</Text>
    </Pressable>
  );
}
