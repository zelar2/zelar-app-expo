// ZELAR+ — Landing Page nativa
// Migração da Landing original do ZELAR Web para Expo/React Native.
// Mantém o fluxo:
//   sessão existente -> /inicio
//   sem sessão       -> Landing
//   botão entrar     -> /auth
//   criar conta      -> /auth?mode=signup

import { useEffect } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Redirect, router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

import { useAuth } from "@/context/auth-context";
import { colors } from "@/theme/colors";

const { width } = Dimensions.get("window");

const BLUE = colors.primary || "#2F80ED";
const LIGHT_BLUE = "#56CCF2";
const GREEN = colors.success || "#27AE60";

function ZelarLogo() {
  return (
    <View style={styles.logoRow}>
      <View style={styles.logoBox}>
        <Text style={styles.logoHeart}>♥</Text>
        <Text style={styles.logoCross}>+</Text>
      </View>

      <View style={styles.logoTextRow}>
        <Text style={styles.logoTextWhite}>ZELAR</Text>
        <Text style={styles.logoPlus}>+</Text>
      </View>
    </View>
  );
}

function FeatureIcon({ symbol }: { symbol: string }) {
  return (
    <View style={styles.featureIcon}>
      <Text style={styles.featureIconText}>{symbol}</Text>
    </View>
  );
}

function CategoryCard({
  icon,
  title,
  description,
  variant,
}: {
  icon: string;
  title: string;
  description: string;
  variant: "blue" | "cyan" | "green";
}) {
  const background =
    variant === "blue"
      ? BLUE
      : variant === "cyan"
        ? LIGHT_BLUE
        : GREEN;

  return (
    <View style={styles.categoryCard}>
      <View style={[styles.categoryIcon, { backgroundColor: background }]}>
        <Text style={styles.categoryIconText}>{icon}</Text>
      </View>

      <Text style={styles.categoryTitle}>{title}</Text>

      <Text style={styles.categoryDescription}>{description}</Text>
    </View>
  );
}

export default function Index() {
  const { session, loading } = useAuth();

  useEffect(() => {
    if (session) {
      router.replace("/inicio");
    }
  }, [session]);

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={BLUE} />
      </View>
    );
  }

  if (session) {
    return <Redirect href="/inicio" />;
  }

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* HERO */}
        <LinearGradient
          colors={[BLUE, LIGHT_BLUE]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <View style={styles.heroGlowOne} />
          <View style={styles.heroGlowTwo} />

          <View style={styles.heroContent}>
            <View style={styles.navbar}>
              <ZelarLogo />

              <Pressable
                onPress={() => router.push("/auth")}
                hitSlop={10}
              >
                <Text style={styles.loginText}>Entrar</Text>
              </Pressable>
            </View>

            <View style={styles.heroCopy}>
              <View style={styles.badge}>
                <Text style={styles.badgeStar}>✦</Text>
                <Text style={styles.badgeText}>
                  Nova plataforma completa
                </Text>
              </View>

              <Text style={styles.heroTitle}>
                Cuidando de quem você ama,
              </Text>

              <Text style={styles.heroTitleLight}>
                onde mais importa.
              </Text>

              <Text style={styles.heroDescription}>
                Home Care digital com atendimento em casa, teleconsulta,
                prontuário eletrônico e mapa inteligente de profissionais
                de saúde.
              </Text>

              <View style={styles.buttons}>
                <Pressable
                  style={({ pressed }) => [
                    styles.primaryButton,
                    pressed && styles.buttonPressed,
                  ]}
                  onPress={() =>
                    router.push({
                      pathname: "/auth",
                      params: { mode: "signup" },
                    })
                  }
                >
                  <Text style={styles.primaryButtonText}>
                    Criar conta grátis
                  </Text>
                  <Text style={styles.arrow}>→</Text>
                </Pressable>

                <Pressable
                  style={({ pressed }) => [
                    styles.secondaryButton,
                    pressed && styles.buttonPressed,
                  ]}
                  onPress={() => router.push("/auth")}
                >
                  <Text style={styles.secondaryButtonText}>
                    Já tenho conta
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* CATEGORIAS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Para quem é o ZELAR+
          </Text>

          <Text style={styles.sectionSubtitle}>
            Um ecossistema para pacientes, familiares e profissionais
            de saúde.
          </Text>

          <View style={styles.categories}>
            <CategoryCard
              icon="♥"
              title="Pacientes"
              description="Solicite cuidados, agende teleconsultas e acompanhe o histórico."
              variant="blue"
            />

            <CategoryCard
              icon="✓"
              title="Familiares"
              description="Acompanhe atendimentos, receba alertas SOS e localização."
              variant="cyan"
            />

            <CategoryCard
              icon="✚"
              title="Profissionais"
              description="Gerencie agenda, evoluções e SAE com assinatura digital."
              variant="green"
            />
          </View>
        </View>

        {/* RECURSOS */}
        <View style={styles.sectionResources}>
          <View style={styles.resourcesCard}>
            <Text style={styles.sectionTitle}>
              Tudo em um só lugar
            </Text>

            <View style={styles.features}>
              <View style={styles.feature}>
                <FeatureIcon symbol="⌖" />
                <View style={styles.featureBody}>
                  <Text style={styles.featureTitle}>
                    Mapa inteligente
                  </Text>
                  <Text style={styles.featureDescription}>
                    Profissionais em tempo real perto de você.
                  </Text>
                </View>
              </View>

              <View style={styles.feature}>
                <FeatureIcon symbol="▶" />
                <View style={styles.featureBody}>
                  <Text style={styles.featureTitle}>
                    Teleconsulta HD
                  </Text>
                  <Text style={styles.featureDescription}>
                    Vídeo, chat e compartilhamento de exames.
                  </Text>
                </View>
              </View>

              <View style={styles.feature}>
                <FeatureIcon symbol="✚" />
                <View style={styles.featureBody}>
                  <Text style={styles.featureTitle}>
                    SAE completa
                  </Text>
                  <Text style={styles.featureDescription}>
                    Processo de Enfermagem e biblioteca de procedimentos.
                  </Text>
                </View>
              </View>

              <View style={styles.feature}>
                <FeatureIcon symbol="✓" />
                <View style={styles.featureBody}>
                  <Text style={styles.featureTitle}>
                    Seguro e LGPD
                  </Text>
                  <Text style={styles.featureDescription}>
                    Criptografia, auditoria e controle de acesso.
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* FOOTER */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            © {new Date().getFullYear()} ZELAR+ · Cuidando de quem você ama.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },

  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F5F7FA",
  },

  scrollContent: {
    paddingBottom: 20,
  },

  hero: {
    minHeight: 500,
    overflow: "hidden",
  },

  heroContent: {
    width: "100%",
    maxWidth: 720,
    alignSelf: "center",
    paddingHorizontal: 22,
    paddingTop: 12,
  },

  heroGlowOne: {
    position: "absolute",
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: "rgba(255,255,255,0.10)",
    top: -110,
    left: -90,
  },

  heroGlowTwo: {
    position: "absolute",
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: "rgba(255,255,255,0.08)",
    right: -140,
    bottom: -100,
  },

  navbar: {
    minHeight: 60,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  logoRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  logoBox: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.22)",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },

  logoHeart: {
    color: "#FFFFFF",
    fontSize: 25,
    lineHeight: 27,
  },

  logoCross: {
    position: "absolute",
    color: BLUE,
    fontSize: 15,
    fontWeight: "900",
    top: 10,
  },

  logoTextRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginLeft: 10,
  },

  logoTextWhite: {
    color: "#FFFFFF",
    fontSize: 23,
    fontWeight: "800",
    letterSpacing: -0.5,
  },

  logoPlus: {
    color: "#FFFFFF",
    fontSize: 23,
    fontWeight: "900",
    marginLeft: 2,
  },

  loginText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },

  heroCopy: {
    paddingTop: 42,
    paddingBottom: 52,
  },

  badge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.16)",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },

  badgeStar: {
    color: "#FFFFFF",
    fontSize: 14,
    marginRight: 6,
  },

  badgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },

  heroTitle: {
    color: "#FFFFFF",
    fontSize: width < 390 ? 35 : 39,
    lineHeight: width < 390 ? 42 : 46,
    fontWeight: "800",
    letterSpacing: -1,
    marginTop: 18,
  },

  heroTitleLight: {
    color: "rgba(255,255,255,0.88)",
    fontSize: width < 390 ? 35 : 39,
    lineHeight: width < 390 ? 42 : 46,
    fontWeight: "800",
    letterSpacing: -1,
  },

  heroDescription: {
    color: "rgba(255,255,255,0.88)",
    fontSize: 15.5,
    lineHeight: 23,
    marginTop: 16,
    maxWidth: 560,
  },

  buttons: {
    marginTop: 25,
    gap: 10,
  },

  primaryButton: {
    minHeight: 52,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  primaryButtonText: {
    color: BLUE,
    fontSize: 15,
    fontWeight: "800",
  },

  arrow: {
    color: BLUE,
    fontSize: 20,
    fontWeight: "700",
    marginLeft: 8,
  },

  secondaryButton: {
    minHeight: 52,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.45)",
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
  },

  secondaryButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },

  buttonPressed: {
    opacity: 0.82,
  },

  section: {
    width: "100%",
    maxWidth: 720,
    alignSelf: "center",
    paddingHorizontal: 20,
    paddingTop: 34,
  },

  sectionTitle: {
    color: "#333333",
    fontSize: 20,
    fontWeight: "800",
  },

  sectionSubtitle: {
    color: "#666666",
    fontSize: 14,
    lineHeight: 20,
    marginTop: 5,
  },

  categories: {
    marginTop: 18,
    gap: 12,
  },

  categoryCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E7EAF0",
    padding: 17,
    shadowColor: "#000000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },

  categoryIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 11,
  },

  categoryIconText: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "800",
  },

  categoryTitle: {
    color: "#333333",
    fontSize: 16,
    fontWeight: "800",
  },

  categoryDescription: {
    color: "#666666",
    fontSize: 13.5,
    lineHeight: 19,
    marginTop: 5,
  },

  sectionResources: {
    width: "100%",
    maxWidth: 720,
    alignSelf: "center",
    paddingHorizontal: 20,
    paddingTop: 28,
  },

  resourcesCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#E7EAF0",
    padding: 20,
    shadowColor: "#000000",
    shadowOpacity: 0.07,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },

  features: {
    marginTop: 18,
    gap: 18,
  },

  feature: {
    flexDirection: "row",
    alignItems: "flex-start",
  },

  featureIcon: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: "#EAF3FF",
    alignItems: "center",
    justifyContent: "center",
  },

  featureIconText: {
    color: BLUE,
    fontSize: 18,
    fontWeight: "800",
  },

  featureBody: {
    flex: 1,
    marginLeft: 11,
  },

  featureTitle: {
    color: "#333333",
    fontSize: 14.5,
    fontWeight: "800",
  },

  featureDescription: {
    color: "#666666",
    fontSize: 13,
    lineHeight: 18,
    marginTop: 2,
  },

  footer: {
    paddingHorizontal: 20,
    paddingVertical: 28,
    borderTopWidth: 1,
    borderTopColor: "#E4E7EC",
    marginTop: 30,
  },

  footerText: {
    textAlign: "center",
    color: "#999999",
    fontSize: 11.5,
  },
});
