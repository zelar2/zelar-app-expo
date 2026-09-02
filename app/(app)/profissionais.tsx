import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useRouter } from "expo-router";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { colors } from "@/theme/colors";

interface ProfRow {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  category: string | null;
  council_number: string | null;
  city: string | null;
  state: string | null;
  bio: string | null;
  preco_hora_cents: number | null;
  raio_atendimento_km: number | null;
  atende_teleconsulta: boolean | null;
  aceita_novos_pacientes: boolean | null;
}

interface VinculoRow {
  profissional_id: string;
  is_primary: boolean;
  especialidade:
    | {
        nome: string;
        categoria: string;
      }
    | null;
}

interface DispoRow {
  profissional_id: string;
  dia_semana: number;
  hora_inicio: string;
  hora_fim: string;
  ativo: boolean;
}

const CATEGORY_ORDER = [
  "medico",
  "enfermeiro",
  "fisioterapeuta",
  "nutricionista",
  "fonoaudiologo",
  "psicologo",
  "terapeuta_ocupacional",
  "cuidador",
  "tecnico_enfermagem",
];

const CATEGORY_LABELS: Record<string, string> = {
  medico: "Médicos",
  enfermeiro: "Enfermeiros",
  fisioterapeuta: "Fisioterapeutas",
  nutricionista: "Nutricionistas",
  fonoaudiologo: "Fonoaudiólogos",
  psicologo: "Psicólogos",
  terapeuta_ocupacional: "Terapeutas ocupacionais",
  cuidador: "Cuidadores",
  tecnico_enfermagem: "Técnicos de enfermagem",
};

function categoryLabel(category: string | null): string {
  if (!category) return "Profissional";
  return CATEGORY_LABELS[category] ?? category.replace(/_/g, " ");
}

function councilLabel(category: string | null): string {
  switch (category) {
    case "enfermeiro":
    case "tecnico_enfermagem":
      return "COREN";
    case "medico":
      return "CRM";
    case "fisioterapeuta":
      return "CREFITO";
    case "nutricionista":
      return "CRN";
    case "fonoaudiologo":
      return "CREFONO";
    case "psicologo":
      return "CRP";
    case "terapeuta_ocupacional":
      return "CREFITO";
    default:
      return "Registro";
  }
}

function initials(name: string | null): string {
  const value = (name ?? "Profissional ZELAR+").trim();

  if (!value) return "P";

  const parts = value.split(/\s+/).filter(Boolean);

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function formatCents(value: number | null): string {
  if (value === null || value === undefined) {
    return "Valor não informado";
  }

  return (value / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function shortTime(value: string): string {
  if (!value) return "";

  return value.slice(0, 5);
}

function FilterChip({
  active,
  onPress,
  children,
}: {
  active: boolean;
  onPress: () => void;
  children: React.ReactNode;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      style={[styles.chip, active ? styles.chipActive : styles.chipInactive]}
    >
      <Text
        style={[
          styles.chipText,
          active ? styles.chipTextActive : styles.chipTextInactive,
        ]}
      >
        {children}
      </Text>
    </Pressable>
  );
}

function Avatar({
  name,
  avatarUrl,
}: {
  name: string | null;
  avatarUrl: string | null;
}) {
  if (avatarUrl) {
    return (
      <Image
        source={{ uri: avatarUrl }}
        style={styles.avatar}
        resizeMode="cover"
      />
    );
  }

  return (
    <View style={[styles.avatar, styles.avatarFallback]}>
      <Text style={styles.avatarText}>{initials(name)}</Text>
    </View>
  );
}

export default function ProfissionaisScreen() {
  const router = useRouter();
  const { user, role, loading: authLoading } = useAuth();

  const [profs, setProfs] = useState<ProfRow[]>([]);
  const [vinculos, setVinculos] = useState<VinculoRow[]>([]);
  const [dispos, setDispos] = useState<DispoRow[]>([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [query, setQuery] = useState("");
  const [categoria, setCategoria] = useState("todas");
  const [soTele, setSoTele] = useState(false);
  const [soDisponiveis, setSoDisponiveis] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const todayIdx = new Date().getDay();

  const isProfissional = role === "profissional" || role === "admin";

  const load = useCallback(async () => {
    if (authLoading) return;

    setLoading(true);
    setErrorMessage(null);

    const [profilesResult, vinculosResult, disposResult] =
      await Promise.all([
        supabase
          .from("profiles")
          .select(
            "id, full_name, avatar_url, category, council_number, city, state, bio, preco_hora_cents, raio_atendimento_km, atende_teleconsulta, aceita_novos_pacientes",
          )
          .order("full_name", { ascending: true }),

        supabase
          .from("profissional_especialidades")
          .select(
            "profissional_id, is_primary, especialidade:especialidades(nome, categoria)",
          ),

        supabase
          .from("disponibilidade_profissional")
          .select(
            "profissional_id, dia_semana, hora_inicio, hora_fim, ativo",
          )
          .eq("ativo", true),
      ]);

    if (profilesResult.error) {
      console.error(
        "Erro ao carregar profissionais:",
        profilesResult.error,
      );
      setErrorMessage("Não foi possível carregar os profissionais.");
      setProfs([]);
    } else {
      setProfs((profilesResult.data as ProfRow[] | null) ?? []);
    }

    if (vinculosResult.error) {
      console.error(
        "Erro ao carregar especialidades:",
        vinculosResult.error,
      );
      setVinculos([]);
    } else {
      setVinculos(
        (vinculosResult.data as unknown as VinculoRow[] | null) ?? [],
      );
    }

    if (disposResult.error) {
      console.error(
        "Erro ao carregar disponibilidades:",
        disposResult.error,
      );
      setDispos([]);
    } else {
      setDispos((disposResult.data as DispoRow[] | null) ?? []);
    }

    setLoading(false);
  }, [authLoading]);

  useEffect(() => {
    void load();
  }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  const vinculosPor = useMemo(() => {
    const map = new Map<string, VinculoRow[]>();

    for (const item of vinculos) {
      const list = map.get(item.profissional_id) ?? [];
      list.push(item);
      map.set(item.profissional_id, list);
    }

    return map;
  }, [vinculos]);

  const disposPor = useMemo(() => {
    const map = new Map<string, DispoRow[]>();

    for (const item of dispos) {
      const list = map.get(item.profissional_id) ?? [];
      list.push(item);
      map.set(item.profissional_id, list);
    }

    return map;
  }, [dispos]);

  const categoriasDisponiveis = useMemo(() => {
    const categories = new Set(
      profs
        .map((item) => item.category)
        .filter((value): value is string => Boolean(value)),
    );

    return CATEGORY_ORDER.filter((category) => categories.has(category));
  }, [profs]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    return profs.filter((professional) => {
      if (
        categoria !== "todas" &&
        professional.category !== categoria
      ) {
        return false;
      }

      if (soTele && !professional.atende_teleconsulta) {
        return false;
      }

      if (
        soDisponiveis &&
        !professional.aceita_novos_pacientes
      ) {
        return false;
      }

      if (!q) return true;

      const specialties = (vinculosPor.get(professional.id) ?? [])
        .map((item) => item.especialidade?.nome ?? "")
        .join(" ")
        .toLowerCase();

      return (
        (professional.full_name ?? "").toLowerCase().includes(q) ||
        categoryLabel(professional.category)
          .toLowerCase()
          .includes(q) ||
        (professional.city ?? "").toLowerCase().includes(q) ||
        specialties.includes(q)
      );
    });
  }, [
    profs,
    query,
    categoria,
    soTele,
    soDisponiveis,
    vinculosPor,
  ]);

  function openProfile(id: string) {
    router.push({
      pathname: "/profissional-perfil",
      params: { id },
    });
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <View>
            <View style={styles.header}>
              <View style={{ flex: 1 }}>
                <Text style={styles.title}>Profissionais</Text>
                <Text style={styles.subtitle}>
                  Perfis por especialidade e disponibilidade
                </Text>
              </View>

              {isProfissional && user ? (
                <Pressable
                  onPress={() => openProfile(user.id)}
                  style={styles.profileButton}
                  accessibilityRole="button"
                  accessibilityLabel="Editar meu perfil profissional"
                >
                  <Text style={styles.profileButtonText}>Meu perfil</Text>
                </Pressable>
              ) : null}
            </View>

            <View style={styles.searchBox}>
              <Text style={styles.searchIcon}>⌕</Text>
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="Buscar por nome, especialidade ou cidade"
                placeholderTextColor={colors.textMuted}
                style={styles.searchInput}
                autoCapitalize="none"
                returnKeyType="search"
                accessibilityLabel="Buscar profissional"
              />
            </View>

            {categoriasDisponiveis.length > 0 ? (
              <FlatList
                horizontal
                data={["todas", ...categoriasDisponiveis]}
                keyExtractor={(item) => item}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.chipsContent}
                renderItem={({ item }) => (
                  <FilterChip
                    active={categoria === item}
                    onPress={() => setCategoria(item)}
                  >
                    {item === "todas"
                      ? "Todas"
                      : categoryLabel(item)}
                  </FilterChip>
                )}
              />
            ) : null}

            <View style={styles.filterRow}>
              <FilterChip
                active={soTele}
                onPress={() => setSoTele((value) => !value)}
              >
                ▣ Teleconsulta
              </FilterChip>

              <FilterChip
                active={soDisponiveis}
                onPress={() =>
                  setSoDisponiveis((value) => !value)
                }
              >
                ✓ Aceitando pacientes
              </FilterChip>
            </View>

            {loading ? (
              <View style={styles.loadingBox}>
                <ActivityIndicator
                  size="small"
                  color={colors.primary}
                />
                <Text style={styles.loadingText}>
                  Carregando profissionais...
                </Text>
              </View>
            ) : null}

            {errorMessage ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{errorMessage}</Text>
                <Pressable onPress={() => void load()}>
                  <Text style={styles.retryText}>Tentar novamente</Text>
                </Pressable>
              </View>
            ) : null}
          </View>
        }
        renderItem={({ item: professional }) => {
          const specialties =
            vinculosPor.get(professional.id) ?? [];

          const primarySpecialty =
            specialties.find((item) => item.is_primary) ??
            specialties[0];

          const todayAvailability = (
            disposPor.get(professional.id) ?? []
          )
            .filter((item) => item.dia_semana === todayIdx)
            .sort((a, b) =>
              a.hora_inicio.localeCompare(b.hora_inicio),
            );

          const todayText =
            todayAvailability.length > 0
              ? `Hoje ${shortTime(todayAvailability[0].hora_inicio)}–${shortTime(todayAvailability[todayAvailability.length - 1].hora_fim)}`
              : "Sem horário hoje";

          return (
            <Pressable
              onPress={() => openProfile(professional.id)}
              style={({ pressed }) => [
                styles.card,
                pressed && styles.cardPressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel={`Abrir perfil de ${professional.full_name ?? "profissional"}`}
            >
              <Avatar
                name={professional.full_name}
                avatarUrl={professional.avatar_url}
              />

              <View style={styles.cardBody}>
                <View style={styles.nameRow}>
                  <Text
                    style={styles.name}
                    numberOfLines={1}
                  >
                    {professional.full_name ??
                      "Profissional ZELAR+"}
                  </Text>

                  {professional.atende_teleconsulta ? (
                    <View style={styles.teleBadge}>
                      <Text style={styles.teleBadgeText}>
                        Tele
                      </Text>
                    </View>
                  ) : null}
                </View>

                <Text
                  style={styles.specialty}
                  numberOfLines={1}
                >
                  {[
                    primarySpecialty?.especialidade?.nome ??
                      categoryLabel(professional.category),
                    professional.council_number
                      ? `${councilLabel(professional.category)} ${professional.council_number}`
                      : null,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </Text>

                <View style={styles.metaRow}>
                  {professional.city ? (
                    <Text
                      style={styles.meta}
                      numberOfLines={1}
                    >
                      📍 {professional.city}
                      {professional.state
                        ? `/${professional.state}`
                        : ""}
                      {professional.raio_atendimento_km != null
                        ? ` · ${professional.raio_atendimento_km} km`
                        : ""}
                    </Text>
                  ) : null}

                  <Text style={styles.meta} numberOfLines={1}>
                    🕐 {todayText}
                  </Text>
                </View>

                <View style={styles.bottomRow}>
                  <Text style={styles.price}>
                    {formatCents(
                      professional.preco_hora_cents,
                    )}
                    {professional.preco_hora_cents != null
                      ? "/h"
                      : ""}
                  </Text>

                  {professional.aceita_novos_pacientes ? (
                    <View style={styles.availableBadge}>
                      <Text style={styles.availableText}>
                        Aceitando pacientes
                      </Text>
                    </View>
                  ) : null}
                </View>

                {specialties.length > 1 ? (
                  <View style={styles.specialtiesRow}>
                    {specialties
                      .slice(0, 3)
                      .map((item, index) => (
                        <View
                          key={`${item.profissional_id}-${index}`}
                          style={styles.specialtyChip}
                        >
                          <Text
                            style={styles.specialtyChipText}
                            numberOfLines={1}
                          >
                            {item.especialidade?.nome}
                          </Text>
                        </View>
                      ))}

                    {specialties.length > 3 ? (
                      <View style={styles.specialtyChip}>
                        <Text style={styles.specialtyChipText}>
                          +{specialties.length - 3}
                        </Text>
                      </View>
                    ) : null}
                  </View>
                ) : null}
              </View>

              <Text style={styles.chevron}>›</Text>
            </Pressable>
          );
        }}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyIcon}>⚕</Text>

              <Text style={styles.emptyTitle}>
                {profs.length === 0
                  ? "Nenhum profissional cadastrado ainda."
                  : "Nenhum profissional encontrado"}
              </Text>

              <Text style={styles.emptyText}>
                {profs.length === 0
                  ? "Quando profissionais forem cadastrados, eles aparecerão aqui."
                  : "Tente alterar a busca ou remover algum filtro."}
              </Text>

              {isProfissional && user ? (
                <Pressable
                  onPress={() => openProfile(user.id)}
                  style={styles.completeButton}
                >
                  <Text style={styles.completeButtonText}>
                    Completar meu perfil profissional
                  </Text>
                </Pressable>
              ) : null}
            </View>
          ) : null
        }
        ListFooterComponent={
          !loading && filtered.length > 0 ? (
            <Text style={styles.footer}>
              {filtered.length} profissional
              {filtered.length !== 1 ? "is" : ""} ·{" "}
              {[
                "domingo",
                "segunda-feira",
                "terça-feira",
                "quarta-feira",
                "quinta-feira",
                "sexta-feira",
                "sábado",
              ][todayIdx]}
            </Text>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  content: {
    padding: 16,
    paddingBottom: 36,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },

  title: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.text,
  },

  subtitle: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 3,
  },

  profileButton: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 11,
    paddingVertical: 8,
    backgroundColor: colors.card,
  },

  profileButtonText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.primary,
  },

  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    height: 46,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.card,
    paddingHorizontal: 12,
  },

  searchIcon: {
    fontSize: 24,
    color: colors.textMuted,
    marginRight: 7,
    marginTop: -3,
  },

  searchInput: {
    flex: 1,
    color: colors.text,
    fontSize: 14,
    paddingVertical: 0,
  },

  chipsContent: {
    gap: 8,
    paddingVertical: 12,
  },

  filterRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 4,
  },

  chip: {
    borderRadius: 999,
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderWidth: 1,
  },

  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },

  chipInactive: {
    backgroundColor: colors.card,
    borderColor: colors.border,
  },

  chipText: {
    fontSize: 12,
    fontWeight: "600",
  },

  chipTextActive: {
    color: colors.textInverse,
  },

  chipTextInactive: {
    color: colors.textMuted,
  },

  loadingBox: {
    minHeight: 100,
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
  },

  loadingText: {
    color: colors.textMuted,
    fontSize: 13,
  },

  errorBox: {
    marginTop: 12,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.danger,
    backgroundColor: colors.card,
  },

  errorText: {
    color: colors.danger,
    fontSize: 13,
  },

  retryText: {
    color: colors.primary,
    fontWeight: "700",
    marginTop: 8,
  },

  card: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 11,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 12,
    marginTop: 9,
  },

  cardPressed: {
    opacity: 0.75,
  },

  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    flexShrink: 0,
  },

  avatarFallback: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EAF2FF",
  },

  avatarText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "800",
  },

  cardBody: {
    flex: 1,
    minWidth: 0,
  },

  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  name: {
    flex: 1,
    fontSize: 15,
    fontWeight: "700",
    color: colors.text,
  },

  teleBadge: {
    borderRadius: 999,
    paddingHorizontal: 6,
    paddingVertical: 3,
    backgroundColor: "#EAF2FF",
  },

  teleBadgeText: {
    fontSize: 9,
    fontWeight: "800",
    color: colors.primary,
  },

  specialty: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 3,
  },

  metaRow: {
    marginTop: 6,
    gap: 3,
  },

  meta: {
    fontSize: 11,
    color: colors.textMuted,
  },

  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    marginTop: 7,
  },

  price: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.text,
  },

  availableBadge: {
    borderRadius: 999,
    paddingHorizontal: 7,
    paddingVertical: 3,
    backgroundColor: "#EAF7EF",
  },

  availableText: {
    color: colors.success,
    fontSize: 9.5,
    fontWeight: "700",
  },

  specialtiesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 5,
    marginTop: 7,
  },

  specialtyChip: {
    maxWidth: 150,
    borderRadius: 999,
    paddingHorizontal: 7,
    paddingVertical: 3,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },

  specialtyChipText: {
    fontSize: 9.5,
    color: colors.textMuted,
  },

  chevron: {
    fontSize: 25,
    color: colors.textMuted,
    marginTop: 8,
  },

  emptyBox: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 55,
  },

  emptyIcon: {
    fontSize: 34,
    color: colors.textMuted,
    marginBottom: 10,
  },

  emptyTitle: {
    textAlign: "center",
    fontSize: 15,
    fontWeight: "700",
    color: colors.text,
  },

  emptyText: {
    textAlign: "center",
    fontSize: 12.5,
    lineHeight: 19,
    color: colors.textMuted,
    marginTop: 6,
  },

  completeButton: {
    marginTop: 16,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },

  completeButtonText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "700",
  },

  footer: {
    textAlign: "center",
    color: colors.textMuted,
    fontSize: 11,
    paddingTop: 14,
  },
});
