import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { router } from "expo-router";
import { BadgeCheck, ChevronRight, Clock, MapPin, Search, Stethoscope, UserCog, Video } from "lucide-react-native";
import { useAuth } from "../../src/hooks/useAuth";
import { supabase } from "../../src/lib/supabase";
import { CATEGORY_ORDER, categoryLabel, councilLabel, formatCents, initials, shortTime, WEEKDAYS } from "../../src/lib/profissionais";


type ProfRow = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  category: string | null;
  council_number: string | null;
  city: string | null;
  state: string | null;
  bio: string | null;
  preco_hora_cents: number | null;
  raio_atendimento_km: number;
  atende_teleconsulta: boolean;
  aceita_novos_pacientes: boolean;
};

type VinculoRow = {
  profissional_id: string;
  is_primary: boolean;
  especialidade: {
    nome: string;
    categoria: string;
  } | null;
};

type DispoRow = {
  profissional_id: string;
  dia_semana: number;
  hora_inicio: string;
  hora_fim: string;
  ativo: boolean;
};

export default function ProfissionaisScreen() {
  const { user, roles } = useAuth();

  const [profs, setProfs] = useState<ProfRow[]>([]);
  const [vinculos, setVinculos] = useState<VinculoRow[]>([]);
  const [dispos, setDispos] = useState<DispoRow[]>([]);
  const [loading, setLoading] = useState(true);

  const [query, setQuery] = useState("");
  const [categoria, setCategoria] = useState("todas");
  const [soTele, setSoTele] = useState(false);
  const [soDisponiveis, setSoDisponiveis] = useState(false);

  const isProfissional =
    roles.includes("profissional") || roles.includes("admin");

  const todayIdx = new Date().getDay();

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);

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

      if (!mounted) return;

      if (profilesResult.error) {
        console.error(
          "Erro ao carregar profissionais:",
          profilesResult.error,
        );
      }

      setProfs((profilesResult.data ?? []) as ProfRow[]);
      setVinculos((vinculosResult.data ?? []) as VinculoRow[]);
      setDispos((disposResult.data ?? []) as DispoRow[]);
      setLoading(false);
    }

    void load();

    return () => {
      mounted = false;
    };
  }, []);

  const vinculosPorProf = useMemo(() => {
    const map = new Map<string, VinculoRow[]>();

    for (const vinculo of vinculos) {
      const current = map.get(vinculo.profissional_id) ?? [];
      current.push(vinculo);
      map.set(vinculo.profissional_id, current);
    }

    return map;
  }, [vinculos]);

  const disposPorProf = useMemo(() => {
    const map = new Map<string, DispoRow[]>();

    for (const dispo of dispos) {
      const current = map.get(dispo.profissional_id) ?? [];
      current.push(dispo);
      map.set(dispo.profissional_id, current);
    }

    return map;
  }, [dispos]);

  const categorias = useMemo(() => {
    const disponiveis = new Set(
      profs
        .map((prof) => prof.category)
        .filter((category): category is string => Boolean(category)),
    );

    return CATEGORY_ORDER.filter((category) => disponiveis.has(category));
  }, [profs]);

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return profs.filter((prof) => {
      if (categoria !== "todas" && prof.category !== categoria) {
        return false;
      }

      if (soTele && !prof.atende_teleconsulta) {
        return false;
      }

      if (soDisponiveis && !prof.aceita_novos_pacientes) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      const professionalVinculos =
        vinculosPorProf.get(prof.id) ?? [];

      const specializationText = professionalVinculos
        .map((item) => item.especialidade?.nome ?? "")
        .join(" ")
        .toLowerCase();

      const searchable = [
        prof.full_name ?? "",
        categoryLabel(prof.category),
        prof.city ?? "",
        specializationText,
      ]
        .join(" ")
        .toLowerCase();

      return searchable.includes(normalizedQuery);
    });
  }, [
    categoria,
    profs,
    query,
    soDisponiveis,
    soTele,
    vinculosPorProf,
  ]);

  const categoriesLabel = (category: string) =>
    categoryLabel(category);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profissionais</Text>
      <Text style={styles.subtitle}>
        Perfis por especialidade e disponibilidade
      </Text>

      <View style={styles.searchBox}>
        <Search size={19} color="#667085" />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Buscar por nome, especialidade ou cidade"
          placeholderTextColor="#98A2B3"
          style={styles.searchInput}
        />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chips}
      >
        <Pressable
          onPress={() => setCategoria("todas")}
          style={[
            styles.chip,
            categoria === "todas" && styles.chipActive,
          ]}
        >
          <Text
            style={[
              styles.chipText,
              categoria === "todas" && styles.chipTextActive,
            ]}
          >
            Todas
          </Text>
        </Pressable>

        {categorias.map((category) => (
          <Pressable
            key={category}
            onPress={() => setCategoria(category)}
            style={[
              styles.chip,
              categoria === category && styles.chipActive,
            ]}
          >
            <Text
              style={[
                styles.chipText,
                categoria === category && styles.chipTextActive,
              ]}
            >
              {categoriesLabel(category)}
            </Text>
          </Pressable>
        ))}

        <Pressable
          onPress={() => setSoTele((value) => !value)}
          style={[styles.chip, soTele && styles.chipActive]}
        >
          <Video size={14} color={soTele ? "#FFFFFF" : "#475467"} />
          <Text
            style={[
              styles.chipText,
              soTele && styles.chipTextActive,
            ]}
          >
            Teleconsulta
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setSoDisponiveis((value) => !value)}
          style={[
            styles.chip,
            soDisponiveis && styles.chipActive,
          ]}
        >
          <BadgeCheck
            size={14}
            color={soDisponiveis ? "#FFFFFF" : "#475467"}
          />
          <Text
            style={[
              styles.chipText,
              soDisponiveis && styles.chipTextActive,
            ]}
          >
            Aceitando pacientes
          </Text>
        </Pressable>
      </ScrollView>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" />
        </View>
      ) : filtered.length === 0 ? (
        <View style={styles.empty}>
          <Stethoscope size={36} color="#98A2B3" />
          <Text style={styles.emptyTitle}>
            {profs.length === 0
              ? "Nenhum profissional cadastrado ainda."
              : "Nenhum profissional encontrado com esses filtros."}
          </Text>

          {isProfissional && user ? (
            <Pressable
              onPress={() =>
                router.push(`/profissional/${user.id}`)
              }
              style={styles.primaryButton}
            >
              <UserCog size={17} color="#FFFFFF" />
              <Text style={styles.primaryButtonText}>
                Completar meu perfil profissional
              </Text>
            </Pressable>
          ) : null}
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.list}
        >
          {filtered.map((prof) => {
            const professionalVinculos =
              vinculosPorProf.get(prof.id) ?? [];

            const professionalDispos =
              disposPorProf.get(prof.id) ?? [];

            const primary =
              professionalVinculos.find(
                (item) => item.is_primary,
              ) ?? professionalVinculos[0];

            const todayDispos = professionalDispos.filter(
              (item) => item.dia_semana === todayIdx,
            );

            return (
              <Pressable
                key={prof.id}
                onPress={() =>
                  router.push(`/profissional/${prof.id}`)
                }
                style={styles.card}
              >
                <View style={styles.avatar}>
                  {prof.avatar_url ? (
                    <Image
                      source={{ uri: prof.avatar_url }}
                      style={styles.avatarImage}
                    />
                  ) : (
                    <Text style={styles.avatarText}>
                      {initials(prof.full_name)}
                    </Text>
                  )}
                </View>

                <View style={styles.cardBody}>
                  <View style={styles.nameRow}>
                    <Text style={styles.name} numberOfLines={1}>
                      {prof.full_name ?? "Profissional ZELAR+"}
                    </Text>

                    {prof.atende_teleconsulta ? (
                      <Video size={16} color="#2F80ED" />
                    ) : null}
                  </View>

                  <Text style={styles.category}>
                    {primary?.especialidade?.nome ??
                      categoryLabel(prof.category)}
                  </Text>

                  <Text style={styles.meta}>
                    {councilLabel(prof.category)}
                    {prof.council_number
                      ? ` · ${prof.council_number}`
                      : ""}
                  </Text>

                  {prof.city || prof.state ? (
                    <View style={styles.infoRow}>
                      <MapPin size={14} color="#667085" />
                      <Text style={styles.infoText}>
                        {[prof.city, prof.state]
                          .filter(Boolean)
                          .join("/")}
                        {prof.raio_atendimento_km
                          ? ` · até ${prof.raio_atendimento_km} km`
                          : ""}
                      </Text>
                    </View>
                  ) : null}

                  <View style={styles.infoRow}>
                    <Clock size={14} color="#667085" />
                    <Text style={styles.infoText}>
                      {todayDispos.length > 0
                        ? todayDispos
                            .map(
                              (item) =>
                                `${shortTime(
                                  item.hora_inicio,
                                )}–${shortTime(item.hora_fim)}`,
                            )
                            .join(" · ")
                        : "Sem horário hoje"}
                    </Text>
                  </View>

                  <View style={styles.footerRow}>
                    <Text style={styles.price}>
                      {formatCents(prof.preco_hora_cents)}/h
                    </Text>

                    {prof.aceita_novos_pacientes ? (
                      <View style={styles.accepted}>
                        <BadgeCheck size={14} color="#27AE60" />
                        <Text style={styles.acceptedText}>
                          Aceitando
                        </Text>
                      </View>
                    ) : null}
                  </View>

                  {professionalVinculos.length > 0 ? (
                    <View style={styles.specialties}>
                      {professionalVinculos
                        .slice(0, 3)
                        .map((item) => (
                          <View
                            key={`${prof.id}-${item.especialidade?.nome}`}
                            style={styles.specialty}
                          >
                            <Text style={styles.specialtyText}>
                              {item.especialidade?.nome ??
                                categoryLabel(
                                  item.especialidade?.categoria ??
                                    prof.category,
                                )}
                            </Text>
                          </View>
                        ))}
                    </View>
                  ) : null}
                </View>

                <ChevronRight size={20} color="#98A2B3" />
              </Pressable>
            );
          })}

          <Text style={styles.count}>
            {filtered.length} profissional(is) ·{" "}
            {WEEKDAYS[todayIdx]?.label}
          </Text>
        </ScrollView>
      )}
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#1F2937",
  },
  subtitle: {
    marginTop: 4,
    fontSize: 13,
    color: "#6B7280",
  },
  searchBox: {
    marginTop: 16,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 14,
    paddingHorizontal: 12,
  },
  searchInput: {
    flex: 1,
    height: 46,
    marginLeft: 8,
    fontSize: 14,
    color: "#111827",
  },
  chips: {
    paddingVertical: 12,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    backgroundColor: "#FFFFFF",
  },
  chipActive: {
    backgroundColor: "#2F80ED",
    borderColor: "#2F80ED",
  },
  chipText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#4B5563",
  },
  chipTextActive: {
    color: "#FFFFFF",
  },
  center: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
  },
  empty: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  emptyTitle: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: "700",
    color: "#374151",
    textAlign: "center",
  },
  primaryButton: {
    marginTop: 16,
    backgroundColor: "#2F80ED",
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  list: {
    paddingTop: 4,
    paddingBottom: 24,
    gap: 12,
  },
  card: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 14,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#E8F1FF",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  avatarImage: {
    width: 56,
    height: 56,
  },
  avatarText: {
    fontSize: 17,
    fontWeight: "800",
    color: "#2F80ED",
  },
  cardBody: {
    flex: 1,
    minWidth: 0,
    marginLeft: 12,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  name: {
    flex: 1,
    fontSize: 16,
    fontWeight: "800",
    color: "#111827",
  },
  category: {
    marginTop: 3,
    fontSize: 13,
    color: "#4B5563",
  },
  meta: {
    marginTop: 3,
    fontSize: 12,
    color: "#6B7280",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 7,
    gap: 6,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: "#6B7280",
  },
  footerRow: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  price: {
    fontSize: 14,
    fontWeight: "800",
    color: "#111827",
  },
  accepted: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "#EAF7EF",
  },
  acceptedText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#27AE60",
  },
  specialties: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 5,
    marginTop: 9,
  },
  specialty: {
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "#F1F5F9",
  },
  specialtyText: {
    fontSize: 10,
    color: "#475569",
  },
  count: {
    paddingTop: 8,
    paddingBottom: 16,
    textAlign: "center",
    fontSize: 12,
    color: "#6B7280",
  },
});
