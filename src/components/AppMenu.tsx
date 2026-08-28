// Porta do menu de navegação (ModuleMenu + module-menu.data.ts do original):
// mesmos grupos, mesmos rótulos e a mesma visibilidade por papel (RBAC),
// renderizados como uma lista nativa dentro do Drawer.
import { Text, View, StyleSheet, Pressable } from "react-native";
import { useRouter, usePathname } from "expo-router";

import { MODULE_GROUPS } from "@/lib/module-menu.data";
import { useAuth } from "@/context/auth-context";
import { colors } from "@/theme/colors";
import type { Role } from "@/permissions/permissions";

export function AppMenu({ onNavigate }: { onNavigate?: () => void }) {
  const router = useRouter();
  const pathname = usePathname();
  const { role } = useAuth();

  return (
    <View style={styles.container}>
      {MODULE_GROUPS.map((group) => {
        const items = group.items.filter(
          (item) => !!role && item.roles.includes(role as Role),
        );
        if (items.length === 0) return null;

        return (
          <View key={group.title} style={styles.group}>
            <Text style={styles.groupTitle}>{group.title}</Text>
            {items.map((item) => {
              const active = pathname === item.to;
              return (
                <Pressable
                  key={item.to}
                  style={[styles.item, active && styles.itemActive]}
                  onPress={() => {
                    router.push(item.to as never);
                    onNavigate?.();
                  }}
                >
                  <Text style={[styles.itemText, active && styles.itemTextActive]}>
                    {item.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingVertical: 12 },
  group: { marginBottom: 18, paddingHorizontal: 16 },
  groupTitle: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 6,
  },
  item: { paddingVertical: 9, paddingHorizontal: 10, borderRadius: 8 },
  itemActive: { backgroundColor: colors.primary + "1A" },
  itemText: { fontSize: 14.5, color: colors.text },
  itemTextActive: { color: colors.primary, fontWeight: "700" },
});
