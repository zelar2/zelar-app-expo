import { useEffect, useMemo, useState } from "react";
import { router } from "expo-router";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  Activity,
  Ambulance,
  Apple,
  Baby,
  BarChart3,
  Brain,
  CalendarPlus,
  ClipboardList,
  Ear,
  HandHeart,
  Heart,
  History,
  MapPinned,
  MessageSquare,
  Pill,
  ShieldCheck,
  Siren,
  Stethoscope,
  UserCheck,
  Users,
  Video,
  Wallet,
} from "lucide-react-native";

import { useAuth } from "../../src/hooks/useAuth";
import { supabase } from "../../src/lib/supabase";

type UserRole = "paciente" | "familiar" | "profissional" | "admin";

type RedirectRole = "cliente" | "executivo" | "suporte";

type ShortcutItem = {
  to: string;
  label: string;
  icon: typeof Ambulance;
  tone?: "primary" | "danger" | "success" | "default";
};

type ProfessionalItem = {
  id: string;
  name: string;
  spec: string;
  city: string | null;
  price: string;
};

const REDIRECT_TARGET: Record<RedirectRole, string> = {
  cliente: "/dashboard-cliente",
  executivo: "/dashboard-executivo",
  suporte: "/suporte",
};

const CATEGORY_LABEL: Record<string, string> = {
  enfermeiro: "Enfermeiro(a)",
  tecnico_enfermagem: "Técnico(a) de Enfermagem",
  auxiliar_enfermagem: "Auxiliar de Enfermagem",
  medico: "Médico(a)",
  psicologo: "Psicólogo(a)",
  fisioterapeuta: "Fisioterapeuta",
  fonoaudiologo: "Fonoaudiólogo(a)",
  nutricionista: "Nutricionista",
  terapeuta_ocupacional: "Terapeuta Ocupacional",
  cuidador: "Cuidador(a)",
};

export default function InicioScreen() {
  const { user, role: primaryRole, roles, loading } = useAuth();

  const [profile, setProfile] = useState<{
    full_name: string | null;
    onboarding_completed: boolean | null;
  } | null>(null);

  const profileLoading = loading || (!!user && !profile);

  useEffect(() => {
    let mounted = true;

    async function loadProfile() {
      if (!user) {
        if (mounted) {
          setProfile(null);
        }
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("full_name, onboarding_completed")
        .eq("id", user.id)
        .maybeSingle();

      if (!mounted) return;

      if (error) {
        console.error("Erro ao carregar perfil:", error);
        setProfile({
          full_name: null,
          onboarding_completed: true,
        });
        return;
      }

      setProfile({
        full_name: data?.full_name ?? null,
        onboarding_completed: data?.onboarding_completed ?? true,
      });
    }

    void loadProfile();

    return () => {
      mounted = false;
    };
  }, [user]);

  const isRedirectRole = useMemo(
    () =>
      primaryRole === "cliente" ||
      primaryRole === "executivo" ||
      primaryRole === "suporte",
    [primaryRole],
  );

  useEffect(() => {
    if (profileLoading || !profile) return;

    if (!profile.onboarding_completed) {
      router.replace("/onboarding");
      return;
    }

    if (
      primaryRole &&
      (primaryRole === "cliente" ||
        primaryRole === "executivo" ||
        primaryRole === "suporte")
    ) {
      router.replace(REDIRECT_TARGET[primaryRole]);
    }
  }, [profileLoading, profile, primaryRole]);

  if (profileLoading || isRedirectRole) {
    return <LoadingScreen />;
  }

  const name = profile?.full_name?.trim().split(" ")[0] || "Bem-vindo";

  const role: UserRole =
    primaryRole === "familiar" ||
    primaryRole === "profissional" ||
    primaryRole === "admin"
      ? primaryRole
      : "paciente";

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.greeting}>
        {getGreeting()}, {name}
      </Text>
      <Text style={styles.roleLabel}>{roleLabel(role)}</Text>

      <HeroBanner role={role} />

      {role === "paciente" && <PacienteHome />}
      {role === "familiar" && <FamiliarHome />}
      {role === "profissional" && <ProfissionalHome />}
      {role === "admin" && <AdminHome />}

      <Text style={styles.debugRoles}>
        {roles.length ? roles.join(" · ") : ""}
      </Text>
    </ScrollView>
  );
}

function LoadingScreen() {
  return (
    <View style={styles.loading}>
      <ActivityIndicator size="large" color="#2F80ED" />
      <Text style={styles.loadingText}>Carregando seu painel...</Text>
    </View>
  );
}

function HeroBanner({ role }: { role: UserRole }) {
  const messages: Record<
    UserRole,
    {
      title: string;
      sub: string;
    }
  > = {
    paciente: {
      title: "Precisa de cuidados agora?",
      sub: "Solicite um profissional em minutos ou agende para depois.",
    },
    familiar: {
      title: "Você está no controle",
      sub: "Acompanhe atendimentos, localização e receba alertas.",
    },
    profissional: {
      title: "Sua agenda te espera",
      sub: "Confira atendimentos, evolua prontuários e receba pacientes.",
    },
    admin: {
      title: "Monitoramento nacional",
      sub: "Dashboard completo do ecossistema ZELAR+.",
    },
  };

  const message = messages[role];

  return (
    <View style={styles.hero}>
      <Text style={styles.heroKicker}>ZELAR+</Text>
      <Text style={styles.heroTitle}>{message.title}</Text>
      <Text style={styles.heroSubtitle}>{message.sub}</Text>

      <View style={styles.heroCircleOne} />
      <View style={styles.heroCircleTwo} />
    </View>
  );
}

function SectionTitle({
  title,
  action,
}: {
  title: string;
  action?: {
    label: string;
    to: string;
  };
}) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>

      {action && (
        <Pressable onPress={() => router.push(action.to as never)}>
          <Text style={styles.sectionAction}>{action.label}</Text>
        </Pressable>
      )}
    </View>
  );
}

function ShortcutGrid({ items }: { items: ShortcutItem[] }) {
  return (
    <View style={styles.shortcutGrid}>
      {items.map((item) => {
        const Icon = item.icon;

        return (
          <Pressable
            key={`${item.to}-${item.label}`}
            style={({ pressed }) => [
              styles.shortcut,
              pressed && styles.pressed,
            ]}
            onPress={() => router.push(item.to as never)}
          >
            <View
              style={[
                styles.shortcutIcon,
                item.tone === "primary" && styles.shortcutPrimary,
                item.tone === "danger" && styles.shortcutDanger,
                item.tone === "success" && styles.shortcutSuccess,
              ]}
            >
              <Icon
                size={21}
                color={
                  item.tone === "primary"
                    ? "#FFFFFF"
                    : item.tone === "danger"
                      ? "#EB5757"
                      : item.tone === "success"
                        ? "#27AE60"
                        : "#2F80ED"
                }
              />
            </View>

            <Text style={styles.shortcutLabel}>{item.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function PacienteHome() {
  return (
    <>
      <SectionTitle title="Atalhos" />

      <ShortcutGrid
        items={[
          {
            to: "/chamadas",
            label: "Solicitar",
            icon: Ambulance,
            tone: "primary",
          },
          {
            to: "/agenda",
            label: "Agendar",
            icon: CalendarPlus,
          },
          {
            to: "/teleconsulta",
            label: "Teleconsulta",
            icon: Video,
          },
          {
            to: "/prontuario",
            label: "Prontuário",
            icon: ClipboardList,
          },
          {
            to: "/mapa",
            label: "Mapa",
            icon: MapPinned,
          },
          {
            to: "/chat",
            label: "Chat",
            icon: MessageSquare,
          },
          {
            to: "/prontuario",
            label: "Medicamentos",
            icon: Pill,
          },
          {
            to: "/sos",
            label: "SOS",
            icon: Siren,
            tone: "danger",
          },
        ]}
      />

      <SectionTitle title="Categorias" />
      <CategoryStrip />

      <SectionTitle
        title="Profissionais próximos"
        action={{
          label: "Ver todos",
          to: "/profissionais",
        }}
      />

      <ProfessionalPreview />
    </>
  );
}

function FamiliarHome() {
  return (
    <>
      <SectionTitle title="Acompanhamento" />

      <ShortcutGrid
        items={[
          {
            to: "/mapa",
            label: "Localização",
            icon: MapPinned,
            tone: "primary",
          },
          {
            to: "/agenda",
            label: "Agenda",
            icon: CalendarPlus,
          },
          {
            to: "/prontuario",
            label: "Histórico",
            icon: History,
          },
          {
            to: "/chat",
            label: "Chat",
            icon: MessageSquare,
          },
          {
            to: "/teleconsulta",
            label: "Teleconsulta",
            icon: Video,
          },
          {
            to: "/sos",
            label: "Alertas SOS",
            icon: Siren,
            tone: "danger",
          },
          {
            to: "/clientes",
            label: "Pessoas",
            icon: Users,
          },
          {
            to: "/minha-conta",
            label: "Permissões",
            icon: ShieldCheck,
          },
        ]}
      />

      <SectionTitle title="Últimos alertas" />

      <View style={styles.emptyCard}>
        <Text style={styles.emptyText}>
          Nenhum alerta recente. Configure os pacientes que você acompanha em
          Perfil.
        </Text>
      </View>
    </>
  );
}

function ProfissionalHome() {
  return (
    <>
      <SectionTitle title="Meu trabalho" />

      <ShortcutGrid
        items={[
          {
            to: "/agenda",
            label: "Agenda",
            icon: CalendarPlus,
            tone: "primary",
          },
          {
            to: "/clientes",
            label: "Clientes",
            icon: Users,
          },
          {
            to: "/chamadas",
            label: "Chamados",
            icon: Ambulance,
          },
          {
            to: "/enfermagem",
            label: "SAE",
            icon: ClipboardList,
            tone: "success",
          },
          {
            to: "/teleconsulta",
            label: "Teleconsulta",
            icon: Video,
          },
          {
            to: "/chat",
            label: "Chat",
            icon: MessageSquare,
          },
          {
            to: "/financeiro",
            label: "Financeiro",
            icon: Wallet,
          },
          {
            to: "/prontuario",
            label: "Evoluções",
            icon: History,
          },
          {
            to: "/meus-documentos",
            label: "Documentos",
            icon: ShieldCheck,
          },
        ]}
      />

      <SectionTitle title="Hoje" />

      <View style={styles.statsGrid}>
        <StatCard
          label="Atendimentos"
          value="0"
          icon={Stethoscope}
        />
        <StatCard
          label="Teleconsultas"
          value="0"
          icon={Video}
        />
        <StatCard
          label="Ganhos (R$)"
          value="0,00"
          icon={Wallet}
        />
      </View>
    </>
  );
}

function AdminHome() {
  return (
    <>
      <SectionTitle title="Painel Administrativo" />

      <ShortcutGrid
        items={[
          {
            to: "/admin",
            label: "Dashboard",
            icon: BarChart3,
            tone: "primary",
          },
          {
            to: "/clientes",
            label: "Clientes",
            icon: Users,
          },
          {
            to: "/profissionais",
            label: "Profissionais",
            icon: UserCheck,
          },
          {
            to: "/aprovacoes",
            label: "Aprovações",
            icon: ShieldCheck,
          },
          {
            to: "/financeiro",
            label: "Financeiro",
            icon: Wallet,
          },
          {
            to: "/auditoria",
            label: "Auditoria",
            icon: History,
          },
          {
            to: "/atendimentos",
            label: "Atendimentos",
            icon: Stethoscope,
          },
          {
            to: "/relatorios",
            label: "Relatórios",
            icon: ClipboardList,
          },
        ]}
      />
    </>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: typeof Stethoscope;
}) {
  return (
    <View style={styles.statCard}>
      <View style={styles.statHeader}>
        <Icon size={17} color="#667085" />
        <Text style={styles.statLabel}>{label}</Text>
      </View>

      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

function CategoryStrip() {
  const categories = [
    {
      label: "Enfermagem",
      icon: Heart,
    },
    {
      label: "Médicos",
      icon: Stethoscope,
    },
    {
      label: "Psicologia",
      icon: Brain,
    },
    {
      label: "Fisioterapia",
      icon: Activity,
    },
    {
      label: "Nutrição",
      icon: Apple,
    },
    {
      label: "Fonoaudiologia",
      icon: Ear,
    },
    {
      label: "Terap. Ocup.",
      icon: HandHeart,
    },
    {
      label: "Cuidador",
      icon: Baby,
    },
  ];

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.categoryStrip}
    >
      {categories.map((category) => {
        const Icon = category.icon;

        return (
          <Pressable
            key={category.label}
            style={({ pressed }) => [
              styles.categoryCard,
              pressed && styles.pressed,
            ]}
            onPress={() => router.push("/profissionais" as never)}
          >
            <View style={styles.categoryIcon}>
              <Icon size={21} color="#2F80ED" />
            </View>

            <Text style={styles.categoryLabel}>{category.label}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

function ProfessionalPreview() {
  const [items, setItems] = useState<ProfessionalItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadProfessionals() {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, category, city, preco_hora_cents")
        .not("category", "is", null)
        .eq("aceita_novos_pacientes", true)
        .limit(3);

      if (!mounted) return;

      if (error) {
        console.error("Erro ao carregar profissionais:", error);
        setItems([]);
        setLoading(false);
        return;
      }

      setItems(
        (data ?? []).map((professional) => ({
          id: professional.id,
          name: professional.full_name?.trim() || "Profissional",
          spec:
            CATEGORY_LABEL[professional.category ?? ""] ||
            "Profissional de saúde",
          city: professional.city,
          price:
            professional.preco_hora_cents != null
              ? `R$ ${(professional.preco_hora_cents / 100).toLocaleString(
                  "pt-BR",
                  {
                    minimumFractionDigits: 0,
                  },
                )}`
              : "A combinar",
        })),
      );

      setLoading(false);
    }

    void loadProfessionals();

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <View style={styles.emptyCard}>
        <ActivityIndicator color="#2F80ED" />
        <Text style={styles.emptyText}>Carregando profissionais...</Text>
      </View>
    );
  }

  if (items.length === 0) {
    return (
      <View style={styles.emptyCard}>
        <Text style={styles.emptyText}>
          Nenhum profissional cadastrado ainda.
        </Text>

        <Pressable onPress={() => router.push("/profissionais" as never)}>
          <Text style={styles.directoryLink}>Ver diretório</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.professionalList}>
      {items.map((professional) => (
        <Pressable
          key={professional.id}
          style={({ pressed }) => [
            styles.professionalCard,
            pressed && styles.pressed,
          ]}
          onPress={() =>
            router.push(
              `/profissional/${professional.id}` as never,
            )
          }
        >
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {getInitials(professional.name)}
            </Text>
          </View>

          <View style={styles.professionalInfo}>
            <Text
              style={styles.professionalName}
              numberOfLines={1}
            >
              {professional.name}
            </Text>

            <Text style={styles.professionalSpec}>
              {professional.spec}
              {professional.city ? ` · ${professional.city}` : ""}
            </Text>
          </View>

          <View style={styles.priceContainer}>
            <Text style={styles.price}>{professional.price}</Text>
            <Text style={styles.priceLabel}>por hora</Text>
          </View>
        </Pressable>
      ))}
    </View>
  );
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function getGreeting() {
  const hour = new Date().getHours();

  if (hour < 12) return "Bom dia";
  if (hour < 18) return "Boa tarde";
  return "Boa noite";
}

function roleLabel(role: UserRole) {
  switch (role) {
    case "paciente":
      return "Paciente";
    case "familiar":
      return "Familiar / responsável";
    case "profissional":
      return "Profissional de saúde";
    case "admin":
      return "Administrador";
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },

  content: {
    padding: 20,
    paddingBottom: 40,
  },

  loading: {
    flex: 1,
    backgroundColor: "#F5F7FA",
    alignItems: "center",
    justifyContent: "center",
  },

  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#667085",
  },

  greeting: {
    fontSize: 24,
    fontWeight: "800",
    color: "#172033",
  },

  roleLabel: {
    marginTop: 3,
    fontSize: 13,
    color: "#667085",
  },

  hero: {
    marginTop: 18,
    borderRadius: 24,
    padding: 20,
    backgroundColor: "#2F80ED",
    overflow: "hidden",
    minHeight: 142,
  },

  heroKicker: {
    color: "#FFFFFFD9",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.2,
  },

  heroTitle: {
    marginTop: 5,
    color: "#FFFFFF",
    fontSize: 21,
    fontWeight: "800",
    maxWidth: "85%",
  },

  heroSubtitle: {
    marginTop: 5,
    color: "#FFFFFFE6",
    fontSize: 13,
    lineHeight: 19,
    maxWidth: "88%",
  },

  heroCircleOne: {
    position: "absolute",
    right: -25,
    top: -35,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#FFFFFF22",
  },

  heroCircleTwo: {
    position: "absolute",
    left: -30,
    bottom: -55,
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: "#FFFFFF18",
  },

  sectionHeader: {
    marginTop: 24,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  sectionTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#667085",
    letterSpacing: 1,
    textTransform: "uppercase",
  },

  sectionAction: {
    fontSize: 12,
    fontWeight: "700",
    color: "#2F80ED",
  },

  shortcutGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },

  shortcut: {
    width: "23.5%",
    minHeight: 100,
    borderWidth: 1,
    borderColor: "#E4E7EC",
    borderRadius: 17,
    backgroundColor: "#FFFFFF",
    padding: 9,
    alignItems: "center",
    justifyContent: "center",
  },

  shortcutIcon: {
    width: 43,
    height: 43,
    borderRadius: 13,
    backgroundColor: "#2F80ED18",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 7,
  },

  shortcutPrimary: {
    backgroundColor: "#2F80ED",
  },

  shortcutDanger: {
    backgroundColor: "#EB575718",
  },

  shortcutSuccess: {
    backgroundColor: "#27AE6018",
  },

  shortcutLabel: {
    textAlign: "center",
    color: "#172033",
    fontSize: 10.5,
    fontWeight: "600",
  },

  categoryStrip: {
    gap: 10,
    paddingBottom: 4,
  },

  categoryCard: {
    width: 100,
    minHeight: 105,
    borderWidth: 1,
    borderColor: "#E4E7EC",
    borderRadius: 17,
    backgroundColor: "#FFFFFF",
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
  },

  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#2F80ED18",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 7,
  },

  categoryLabel: {
    fontSize: 10.5,
    fontWeight: "600",
    color: "#172033",
    textAlign: "center",
  },

  emptyCard: {
    borderWidth: 1,
    borderColor: "#E4E7EC",
    borderRadius: 17,
    backgroundColor: "#FFFFFF",
    padding: 16,
    alignItems: "center",
  },

  emptyText: {
    fontSize: 13,
    color: "#667085",
    textAlign: "center",
    lineHeight: 19,
  },

  directoryLink: {
    marginTop: 8,
    fontSize: 13,
    color: "#2F80ED",
    fontWeight: "700",
  },

  statsGrid: {
    gap: 10,
  },

  statCard: {
    borderWidth: 1,
    borderColor: "#E4E7EC",
    borderRadius: 17,
    backgroundColor: "#FFFFFF",
    padding: 15,
  },

  statHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },

  statLabel: {
    fontSize: 12,
    color: "#667085",
  },

  statValue: {
    marginTop: 4,
    fontSize: 25,
    fontWeight: "800",
    color: "#172033",
  },

  professionalList: {
    gap: 10,
  },

  professionalCard: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E4E7EC",
    borderRadius: 17,
    backgroundColor: "#FFFFFF",
    padding: 12,
  },

  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#2F80ED",
    alignItems: "center",
    justifyContent: "center",
  },

  avatarText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },

  professionalInfo: {
    flex: 1,
    marginLeft: 11,
    minWidth: 0,
  },

  professionalName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#172033",
  },

  professionalSpec: {
    marginTop: 3,
    fontSize: 11,
    color: "#667085",
  },

  priceContainer: {
    alignItems: "flex-end",
    marginLeft: 8,
  },

  price: {
    fontSize: 13,
    fontWeight: "800",
    color: "#172033",
  },

  priceLabel: {
    marginTop: 2,
    fontSize: 9,
    color: "#667085",
  },

  pressed: {
    opacity: 0.72,
  },

  debugRoles: {
    display: "none",
  },
});
