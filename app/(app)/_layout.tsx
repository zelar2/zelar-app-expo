// Equivalente ao AppShell + RouteAccessGuard do projeto original: envolve
// todas as rotas autenticadas, redireciona para /auth se não houver sessão,
// e mostra o menu lateral (Drawer) com os mesmos módulos/RBAC do web.
import { Redirect } from "expo-router";
import { Drawer } from "expo-router/drawer";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";

import { useAuth } from "@/context/auth-context";
import { AppMenu } from "@/components/AppMenu";
import { colors } from "@/theme/colors";
import { MODULE_GROUPS } from "@/lib/module-menu.data";

function CustomDrawerContent({
  navigation,
}: {
  navigation?: {
    closeDrawer?: () => void;
  };
}) {
  const { user, role, signOut } = useAuth();

  return (
    <View style={{ flex: 1, backgroundColor: colors.card }}>
      <View style={styles.drawerHeader}>
        <Text style={styles.brand}>ZELAR+</Text>
        <Text style={styles.userEmail} numberOfLines={1}>
          {user?.email}
        </Text>
        {role && <Text style={styles.userRole}>{role}</Text>}
      </View>
      <View style={{ flex: 1 }}>
        <AppMenu onNavigate={() => navigation?.closeDrawer?.()} />
      </View>
      <Pressable style={styles.logout} onPress={() => signOut()}>
        <Text style={styles.logoutText}>Sair</Text>
      </Pressable>
    </View>
  );
}

export default function AppLayout() {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  if (!session) {
    return <Redirect href="/auth" />;
  }

  // Gera dinamicamente uma entrada de Drawer.Screen para cada rota do menu,
  // reaproveitando os mesmos labels/paths do MODULE_GROUPS original, mais as
  // rotas secundárias (formulários "novo" e fichas de detalhe) que no
  // projeto original não ficam no menu principal — acessíveis via
  // navegação a partir das listagens (ex: router.push("/usuarios-detalhe")).
  const allItems = MODULE_GROUPS.flatMap((g) => g.items);
  const secondaryRoutes: { to: string; label: string }[] = [
    { to: "/usuarios-detalhe", label: "Detalhe do usuário" },
    { to: "/cliente-perfil", label: "Ficha do cliente" },
    { to: "/profissional-perfil", label: "Perfil do profissional" },
    { to: "/chamada-detalhe", label: "Detalhe da chamada" },
    { to: "/colaboradores-novo", label: "Novo colaborador" },
    { to: "/contratos-novo", label: "Novo contrato" },
    { to: "/afastamentos-novo", label: "Novo afastamento" },
    { to: "/escalas-novo", label: "Nova escala" },
    { to: "/ferias-novo", label: "Novas férias" },
    { to: "/banco-horas-novo", label: "Novo lançamento de banco de horas" },
    { to: "/avaliacoes-funcionarios-novo", label: "Nova avaliação de funcionário" },
    { to: "/folha-pagamento-novo", label: "Nova folha de pagamento" },
    { to: "/onboarding", label: "Onboarding" },
    { to: "/backup", label: "Backup" },
  ];

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer
        drawerContent={(props) => <CustomDrawerContent {...props} />}
        screenOptions={{
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.textInverse,
          drawerActiveTintColor: colors.primary,
        }}
      >
        {allItems.map((item) => {
          const name = item.to.replace(/^\//, "");
          return (
            <Drawer.Screen
              key={name}
              name={name}
              options={{ title: item.label, drawerLabel: item.label }}
            />
          );
        })}
        {secondaryRoutes.map((item) => {
          const name = item.to.replace(/^\//, "");
          return (
            <Drawer.Screen
              key={name}
              name={name}
              options={{ title: item.label, drawerItemStyle: { display: "none" } }}
            />
          );
        })}
      </Drawer>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background },
  drawerHeader: { padding: 20, paddingTop: 50, backgroundColor: colors.background },
  brand: { color: colors.primary, fontSize: 22, fontWeight: "800" },
  userEmail: { color: colors.textInverse, marginTop: 8, fontSize: 13 },
  userRole: {
    color: colors.primary,
    marginTop: 4,
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  logout: {
    margin: 16,
    padding: 12,
    borderRadius: 10,
    backgroundColor: "#FEE2E2",
    alignItems: "center",
  },
  logoutText: { color: colors.danger, fontWeight: "700" },
});
