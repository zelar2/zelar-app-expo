// Porta completa de src/routes/_authenticated/inicio.tsx: dashboard inicial
// personalizado por papel (paciente/familiar/profissional/admin), com hero
// banner, grade de atalhos, tira de categorias e prévia de profissionais
// reais (mesma lógica/tabelas do original), além do redirect para o painel
// dedicado de cliente/executivo/suporte e para o onboarding.
import { useEffect, useMemo, useState } from "react";
import { Redirect, useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { useAuth } from "@/context/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { colors } from "@/theme/colors";
import { Card, InitialsAvatar, SectionHeader } from "@/components/ui/Kit";
import type { AppRole } from "@/context/auth-context";

const REDIRECT_TARGET: Partial<Record<AppRole, string>> = {
  cliente: "/dashboard-cliente",
  executivo: "/dashboard-executivo",
  suporte: "/suporte",
};

const ROLE_LABEL: Record<string, string> = {
  paciente: "Paciente",
  familiar: "Familiar / responsável",
  profissional: "Profissional de saúde",
  admin: "Administrador",
};

const HERO: Record<string, { title: string; sub: string }> = {
  paciente: { title: "Precisa de cuidados agora?", sub: "Solicite um profissional em minutos ou agende para depois." },
  familiar: { title: "Você está no controle", sub: "Acompanhe atendimentos, localização e receba alertas." },
  profissional: { title: "Sua agenda te espera", sub: "Confira atendimentos, evolua prontuários e receba pacientes." },
  admin: { title: "Monitoramento nacional", sub: "Dashboard completo do ecossistema ZELAR+." },
};

interface Shortcut {
  to: string;
  label: string;
  tone?: "primary" | "danger" | "success";
}

const SHORTCUTS: Record<string, Shortcut[]> = {
  paciente: [
    { to: "/chamadas", label: "Solicitar", tone: "primary" },
    { to: "/agenda", label: "Agendar" },
    { to: "/teleconsulta", label: "Teleconsulta" },
    { to: "/prontuario", label: "Prontuário" },
    { to: "/mapa", label: "Mapa" },
    { to: "/chat", label: "Chat" },
    { to: "/prontuario", label: "Medicamentos" },
    { to: "/sos", label: "SOS", tone: "danger" },
  ],
  familiar: [
    { to: "/mapa", label: "Localização", tone: "primary" },
    { to: "/agenda", label: "Agenda" },
    { to: "/prontuario", label: "Histórico" },
    { to: "/chat", label: "Chat" },
    { to: "/teleconsulta", label: "Teleconsulta" },
    { to: "/sos", label: "Alertas SOS", tone: "danger" },
    { to: "/clientes", label: "Pessoas" },
    { to: "/minha-conta", label: "Permissões" },
  ],
  profissional: [
    { to: "/agenda", label: "Agenda", tone: "primary" },
    { to: "/clientes", label: "Clientes" },
    { to: "/chamadas", label: "Chamados" },
    { to: "/enfermagem", label: "SAE", tone: "success" },
    { to: "/teleconsulta", label: "Teleconsulta" },
    { to: "/chat", label: "Chat" },
    { to: "/financeiro", label: "Financeiro" },
    { to: "/prontuario", label: "Evoluções" },
  ],
  admin: [
    { to: "/admin", label: "Dashboard", tone: "primary" },
    { to: "/clientes", label: "Clientes" },
    { to: "/profissionais", label: "Profissionais" },
    { to: "/aprovacoes", label: "Aprovações" },
    { to: "/financeiro", label: "Financeiro" },
    { to: "/auditoria", label: "Auditoria" },
    { to: "/atendimentos", label: "Atendimentos" },
    { to: "/relatorios", label: "Relatórios" },
  ],
};

const CATEGORIES = [
  "Enfermagem",
  "Médicos",
  "Psicologia",
  "Fisioterapia",
  "Nutrição",
  "Fonoaudiologia",
  "Terap. Ocup.",
  "Cuidador",
];

const CATEGORIA_LABEL: Record<string, string> = {
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

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
}

export default function InicioScreen() {
  const { user, role, loading } = useAuth();
  const router = useRouter();
  const greeting = useMemo(() => getGreeting(), []);

  const isRedirectRole = role && role in REDIRECT_TARGET;
  const effectiveRole = (role && !isRedirectRole ? role : "paciente") as keyof typeof HERO;

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingBrand}>ZELAR+</Text>
        <Text style={styles.loadingText}>Preparando seu ambiente...</Text>
      </View>
    );
  }

  if (isRedirectRole) {
    return <Redirect href={REDIRECT_TARGET[role as AppRole] as never} />;
  }

  // Usuário autenticado sem papel ainda não pode cair silenciosamente
  // no perfil de paciente.
  if (!role) {
    return <Redirect href="/onboarding" />;
  }

  const metadataName =
    typeof user?.user_metadata?.full_name === "string"
      ? user.user_metadata.full_name.trim()
      : "";

  const name =
    metadataName ||
    user?.email?.split("@")[0] ||
    "Bem-vindo";

  const hero = HERO[effectiveRole] ?? HERO.paciente;
  const shortcuts = SHORTCUTS[effectiveRole] ?? SHORTCUTS.paciente;

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
      <Text style={styles.greeting}>
        {greeting}, {name}
      </Text>
      {ROLE_LABEL[effectiveRole] && <Text style={styles.subtitle}>{ROLE_LABEL[effectiveRole]}</Text>}

      <View style={styles.hero}>
        <Text style={styles.heroKicker}>ZELAR+</Text>
        <Text style={styles.heroTitle}>{hero.title}</Text>
        <Text style={styles.heroSub}>{hero.sub}</Text>
      </View>

      <SectionHeader title="Atalhos" />
      <View style={styles.grid}>
        {shortcuts.map((it, i) => (
          <Pressable
            key={it.to + it.label + i}
            onPress={() => router.push(it.to as never)}
            style={({ pressed }) => [styles.shortcut, pressed && { opacity: 0.7 }]}
          >
            <View
              style={[
                styles.shortcutIcon,
                it.tone === "primary" && { backgroundColor: colors.primary },
                it.tone === "danger" && { backgroundColor: colors.danger + "1A" },
                it.tone === "success" && { backgroundColor: colors.success + "1A" },
              ]}
            >
              <Text
                style={[
                  styles.shortcutIconText,
                  it.tone === "primary" && { color: colors.textInverse },
                  it.tone === "danger" && { color: colors.danger },
                  it.tone === "success" && { color: colors.success },
                ]}
              >
                {it.label.slice(0, 1)}
              </Text>
            </View>
            <Text style={styles.shortcutLabel} numberOfLines={2}>
              {it.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {effectiveRole === "paciente" && (
        <>
          <SectionHeader title="Categorias" />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
            {CATEGORIES.map((c) => (
              <Pressable key={c} onPress={() => router.push("/profissionais" as never)} style={styles.categoryChip}>
                <Text style={styles.categoryText}>{c}</Text>
              </Pressable>
            ))}
          </ScrollView>

          <SectionHeader
            title="Profissionais próximos"
            action={
              <Pressable onPress={() => router.push("/profissionais" as never)}>
                <Text style={styles.link}>Ver todos</Text>
              </Pressable>
            }
          />
          <ProfessionalPreview />
        </>
      )}

      {effectiveRole === "familiar" && (
        <>
          <SectionHeader title="Últimos alertas" />
          <Card>
            <Text style={styles.mutedText}>
              Nenhum alerta recente. Configure os pacientes que você acompanha em Perfil.
            </Text>
          </Card>
        </>
      )}

      {effectiveRole === "profissional" && (
        <>
          <SectionHeader title="Hoje" />
          <View style={{ flexDirection: "row", gap: 10 }}>
            <Card style={{ flex: 1 }}>
              <Text style={styles.statLabel}>Atendimentos</Text>
              <Text style={styles.statValue}>0</Text>
            </Card>
            <Card style={{ flex: 1 }}>
              <Text style={styles.statLabel}>Teleconsultas</Text>
              <Text style={styles.statValue}>0</Text>
            </Card>
            <Card style={{ flex: 1 }}>
              <Text style={styles.statLabel}>Ganhos (R$)</Text>
              <Text style={styles.statValue}>0,00</Text>
            </Card>
          </View>
        </>
      )}
    </ScrollView>
  );
}

function ProfessionalPreview() {
  type ProfItem = { id: string; name: string; spec: string; city: string | null; price: string };
  const [items, setItems] = useState<ProfItem[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("id, full_name, category, city, preco_hora_cents")
        .not("category", "is", null)
        .eq("aceita_novos_pacientes", true)
        .limit(3);
      if (cancelled) return;
      setItems(
        (data ?? []).map((p) => ({
          id: p.id,
          name: p.full_name?.trim() || "Profissional",
          spec: CATEGORIA_LABEL[p.category ?? ""] ?? "Profissional de saúde",
          city: p.city,
          price:
            p.preco_hora_cents != null
              ? `R$ ${(p.preco_hora_cents / 100).toLocaleString("pt-BR", { minimumFractionDigits: 0 })}`
              : "A combinar",
        })),
      );
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) return <Text style={styles.mutedText}>Carregando profissionais...</Text>;

  if (items.length === 0) {
    return (
      <Card>
        <Text style={styles.mutedText}>
          Nenhum profissional cadastrado ainda.{" "}
          <Text style={styles.link} onPress={() => router.push("/profissionais" as never)}>
            Ver diretório
          </Text>
        </Text>
      </Card>
    );
  }

  return (
    <View style={{ gap: 10 }}>
      {items.map((p) => (
        <Pressable key={p.id} onPress={() => router.push(`/profissional-perfil?id=${p.id}` as never)}>
          <Card style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <InitialsAvatar name={p.name} size={48} />
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={styles.profName} numberOfLines={1}>
                {p.name}
              </Text>
              <Text style={styles.profSub} numberOfLines={1}>
                {p.spec}
                {p.city ? ` · ${p.city}` : ""}
              </Text>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Text style={styles.profPrice}>{p.price}</Text>
              <Text style={styles.profPriceUnit}>por hora</Text>
            </View>
          </Card>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
    paddingHorizontal: 24,
  },
  loadingBrand: {
    fontSize: 28,
    fontWeight: "800",
    color: colors.primary,
    letterSpacing: 1,
  },
  loadingText: {
    marginTop: 8,
    fontSize: 13,
    color: colors.textMuted,
  },
  container: { flex: 1, backgroundColor: colors.card },
  greeting: { fontSize: 20, fontWeight: "800", color: colors.text },
  subtitle: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
  hero: {
    marginTop: 16,
    borderRadius: 24,
    padding: 20,
    backgroundColor: colors.primary,
    overflow: "hidden",
  },
  heroKicker: { color: "#FFFFFFD9", fontSize: 11, fontWeight: "700", letterSpacing: 1, textTransform: "uppercase" },
  heroTitle: { color: colors.textInverse, fontSize: 20, fontWeight: "800", marginTop: 4 },
  heroSub: { color: "#FFFFFFE6", fontSize: 13.5, marginTop: 4 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 4 },
  shortcut: {
    width: "22.5%",
    alignItems: "center",
    gap: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  shortcutIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.primary + "1A",
    alignItems: "center",
    justifyContent: "center",
  },
  shortcutIconText: { fontWeight: "800", color: colors.primary },
  shortcutLabel: { fontSize: 10.5, fontWeight: "600", color: colors.text, textAlign: "center" },
  categoryChip: {
    minWidth: 92,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    paddingVertical: 14,
    paddingHorizontal: 12,
    alignItems: "center",
  },
  categoryText: { fontSize: 11.5, fontWeight: "600", color: colors.text, textAlign: "center" },
  link: { fontSize: 12.5, fontWeight: "700", color: colors.primary },
  mutedText: { fontSize: 13.5, color: colors.textMuted, lineHeight: 20 },
  statLabel: { fontSize: 11, color: colors.textMuted, fontWeight: "600" },
  statValue: { fontSize: 20, fontWeight: "800", color: colors.text, marginTop: 4 },
  profName: { fontSize: 14.5, fontWeight: "700", color: colors.text },
  profSub: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  profPrice: { fontSize: 14, fontWeight: "700", color: colors.text },
  profPriceUnit: { fontSize: 10, color: colors.textMuted },
});
