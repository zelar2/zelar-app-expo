import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

import { colors } from "@/theme/colors";


type ProfessionalCategory = string;

type Weekday = {
  value: number;
  label: string;
};

const CATEGORY_ORDER: ProfessionalCategory[] = [
  "enfermeiro",
  "tecnico_enfermagem",
  "auxiliar_enfermagem",
  "cuidador",
  "fisioterapeuta",
  "nutricionista",
  "psicologo",
  "fonoaudiologo",
  "terapeuta_ocupacional",
  "medico",
];

const WEEKDAYS: Weekday[] = [
  { value: 0, label: "Domingo" },
  { value: 1, label: "Segunda-feira" },
  { value: 2, label: "Terça-feira" },
  { value: 3, label: "Quarta-feira" },
  { value: 4, label: "Quinta-feira" },
  { value: 5, label: "Sexta-feira" },
  { value: 6, label: "Sábado" },
];

function categoryLabel(category: string | null | undefined): string {
  const labels: Record<string, string> = {
    enfermeiro: "Enfermeiro(a)",
    tecnico_enfermagem: "Técnico(a) de enfermagem",
    cuidador: "Cuidador(a)",
    fisioterapeuta: "Fisioterapeuta",
    nutricionista: "Nutricionista",
    psicologo: "Psicólogo(a)",
    fonoaudiologo: "Fonoaudiólogo(a)",
    terapeuta_ocupacional: "Terapeuta ocupacional",
    medico: "Médico(a)",
  };

  return category ? labels[category] ?? category : "Profissional";
}

function councilLabel(category: string | null | undefined): string {
  const labels: Record<string, string> = {
    enfermeiro: "COREN",
    tecnico_enfermagem: "COREN",
    fisioterapeuta: "CREFITO",
    nutricionista: "CRN",
    psicologo: "CRP",
    fonoaudiologo: "CREFONO",
    terapeuta_ocupacional: "CREFITO",
    medico: "CRM",
  };

  return category ? labels[category] ?? "Registro" : "Registro";
}

function formatCents(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(Number(value))) {
    return "R$ 0,00";
  }

  return (Number(value) / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function formatCentsInput(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(Number(value))) {
    return "";
  }

  return (Number(value) / 100).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function parseCurrencyToCents(value: string): number {
  const normalized = value
    .replace(/\s/g, "")
    .replace(/^R\$\s?/, "")
    .replace(/\./g, "")
    .replace(",", ".");

  const parsed = Number(normalized);

  return Number.isFinite(parsed) ? Math.round(parsed * 100) : 0;
}

function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);

  if (!digits) return "";
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 6) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  }
  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }

  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

function initials(name: string | null | undefined): string {
  const parts = (name ?? "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) return "P";

  return parts
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

function shortTime(value: string | null | undefined): string {
  return value ? value.slice(0, 5) : "--:--";
}

interface ProfDetail {
  id: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  city: string | null;
  state: string | null;
  bio: string | null;
  category: string | null;
  council_number: string | null;
  preco_hora_cents: number | null;
  raio_atendimento_km: number;
  atende_teleconsulta: boolean;
  aceita_novos_pacientes: boolean;
}

interface Especialidade {
  id: string;
  nome: string;
  categoria: string;
}

interface Vinculo {
  id: string;
  especialidade_id: string;
  is_primary: boolean;
  anos_experiencia: number;
  preco_hora_cents: number | null;
  observacoes: string | null;
  especialidade: {
    nome: string;
    categoria: string;
  } | null;
}

interface Dispo {
  id: string;
  dia_semana: number;
  hora_inicio: string;
  hora_fim: string;
  atende_domicilio: boolean;
  atende_teleconsulta: boolean;
  ativo: boolean;
}

function showError(message: string) {
  Alert.alert("ZELAR+", message);
}

function showSuccess(message: string) {
  Alert.alert("ZELAR+", message);
}

export default function ProfissionalPerfilScreen() {
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const profId = Array.isArray(params.id) ? params.id[0] : params.id;
  const router = useRouter();
  const { user, role, loading: authLoading } = useAuth();

  const [prof, setProf] = useState<ProfDetail | null>(null);
  const [catalogo, setCatalogo] = useState<Especialidade[]>([]);
  const [vinculos, setVinculos] = useState<Vinculo[]>([]);
  const [dispos, setDispos] = useState<Dispo[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tab, setTab] = useState<"dados" | "especialidades" | "agenda">("dados");

  const canEdit = !!user && !!profId && (user.id === profId || role === "admin");

  const load = useCallback(async () => {
    if (!profId) {
      setLoading(false);
      return;
    }

    setLoading(true);

    const [p, c, v, d] = await Promise.all([
      supabase
        .from("profiles")
        .select(
          "id, full_name, phone, avatar_url, city, state, bio, category, council_number, preco_hora_cents, raio_atendimento_km, atende_teleconsulta, aceita_novos_pacientes",
        )
        .eq("id", profId)
        .maybeSingle(),

      supabase
        .from("especialidades")
        .select("id, nome, categoria")
        .eq("is_active", true)
        .order("nome", { ascending: true }),

      supabase
        .from("profissional_especialidades")
        .select(
          "id, especialidade_id, is_primary, anos_experiencia, preco_hora_cents, observacoes, especialidade:especialidades(nome, categoria)",
        )
        .eq("profissional_id", profId)
        .order("is_primary", { ascending: false }),

      supabase
        .from("disponibilidade_profissional")
        .select(
          "id, dia_semana, hora_inicio, hora_fim, atende_domicilio, atende_teleconsulta, ativo",
        )
        .eq("profissional_id", profId)
        .order("dia_semana", { ascending: true })
        .order("hora_inicio", { ascending: true }),
    ]);

    if (p.error) {
      showError("Não foi possível carregar o perfil.");
    }

    setProf((p.data as ProfDetail | null) ?? null);
    setCatalogo((c.data as Especialidade[] | null) ?? []);
    setVinculos((v.data as unknown as Vinculo[] | null) ?? []);
    setDispos((d.data as Dispo[] | null) ?? []);
    setLoading(false);
  }, [profId]);

  useEffect(() => {
    if (!authLoading) {
      void load();
    }
  }, [authLoading, load]);

  async function refresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  if (loading || authLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Carregando perfil...</Text>
      </View>
    );
  }

  if (!prof) {
    return (
      <View style={styles.centerContent}>
        <Text style={styles.emptyTitle}>Profissional não encontrado.</Text>
        <Pressable style={styles.outlineButton} onPress={() => router.back()}>
          <Text style={styles.outlineButtonText}>Voltar para a lista</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refresh} />
        }
      >
        <View style={styles.header}>
          <Pressable
            style={styles.backButton}
            onPress={() => router.back()}
            accessibilityLabel="Voltar"
          >
            <Text style={styles.backIcon}>‹</Text>
          </Pressable>

          <View style={styles.headerText}>
            <Text style={styles.title} numberOfLines={1}>
              {prof.full_name ?? "Profissional"}
            </Text>
            <Text style={styles.subtitle}>
              {categoryLabel(prof.category)}
            </Text>
          </View>
        </View>

        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            {prof.avatar_url ? (
              <Image
                source={{ uri: prof.avatar_url }}
                style={styles.avatarImage}
              />
            ) : (
              <Text style={styles.avatarText}>{initials(prof.full_name)}</Text>
            )}
          </View>

          <View style={styles.profileMain}>
            <Text style={styles.profileName} numberOfLines={2}>
              {prof.full_name ?? "Profissional ZELAR+"}
            </Text>

            <Text style={styles.profileCategory}>
              {categoryLabel(prof.category)}
              {prof.council_number
                ? ` · ${councilLabel(prof.category)} ${prof.council_number}`
                : ""}
            </Text>

            <View style={styles.badges}>
              <Badge text={`${formatCents(prof.preco_hora_cents)}/h`} />

              {prof.atende_teleconsulta && (
                <Badge text="🎥 Teleconsulta" outline />
              )}

              <Badge
                text={
                  prof.aceita_novos_pacientes
                    ? "✓ Aceitando pacientes"
                    : "Agendamento fechado"
                }
                outline={!prof.aceita_novos_pacientes}
              />
            </View>
          </View>
        </View>

        <View style={styles.tabs}>
          <TabButton
            active={tab === "dados"}
            onPress={() => setTab("dados")}
          >
            Dados
          </TabButton>
          <TabButton
            active={tab === "especialidades"}
            onPress={() => setTab("especialidades")}
          >
            Especialidades
          </TabButton>
          <TabButton
            active={tab === "agenda"}
            onPress={() => setTab("agenda")}
          >
            Disponibilidade
          </TabButton>
        </View>

        {tab === "dados" && (
          <DadosTab
            prof={prof}
            canEdit={canEdit}
            onSaved={load}
          />
        )}

        {tab === "especialidades" && (
          <EspecialidadesTab
            profId={prof.id}
            canEdit={canEdit}
            catalogo={catalogo}
            vinculos={vinculos}
            onChanged={load}
          />
        )}

        {tab === "agenda" && (
          <AgendaTab
            profId={prof.id}
            canEdit={canEdit}
            dispos={dispos}
            onChanged={load}
          />
        )}
      </ScrollView>
    </View>
  );
}

function Badge({
  text,
  outline = false,
}: {
  text: string;
  outline?: boolean;
}) {
  return (
    <View style={[styles.badge, outline && styles.badgeOutline]}>
      <Text style={[styles.badgeText, outline && styles.badgeOutlineText]}>
        {text}
      </Text>
    </View>
  );
}

function TabButton({
  active,
  onPress,
  children,
}: {
  active: boolean;
  onPress: () => void;
  children: ReactNode;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.tabButton, active && styles.tabButtonActive]}
    >
      <Text style={[styles.tabText, active && styles.tabTextActive]}>
        {children}
      </Text>
    </Pressable>
  );
}

function DadosTab({
  prof,
  canEdit,
  onSaved,
}: {
  prof: ProfDetail;
  canEdit: boolean;
  onSaved: () => Promise<void>;
}) {
  const [form, setForm] = useState({
    full_name: prof.full_name ?? "",
    phone: prof.phone ?? "",
    city: prof.city ?? "",
    state: prof.state ?? "",
    bio: prof.bio ?? "",
    category: prof.category ?? "",
    council_number: prof.council_number ?? "",
    preco: formatCentsInput(prof.preco_hora_cents),
    raio: String(prof.raio_atendimento_km ?? 0),
    atende_teleconsulta: prof.atende_teleconsulta,
    aceita_novos_pacientes: prof.aceita_novos_pacientes,
  });

  const [saving, setSaving] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);

  useEffect(() => {
    setForm({
      full_name: prof.full_name ?? "",
      phone: prof.phone ?? "",
      city: prof.city ?? "",
      state: prof.state ?? "",
      bio: prof.bio ?? "",
      category: prof.category ?? "",
      council_number: prof.council_number ?? "",
      preco: formatCentsInput(prof.preco_hora_cents),
      raio: String(prof.raio_atendimento_km ?? 0),
      atende_teleconsulta: prof.atende_teleconsulta,
      aceita_novos_pacientes: prof.aceita_novos_pacientes,
    });
  }, [prof]);

  async function save() {
    if (!form.full_name.trim()) {
      showError("Informe o nome do profissional.");
      return;
    }

    setSaving(true);

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: form.full_name.trim(),
        phone: form.phone || null,
        city: form.city || null,
        state: form.state || null,
        bio: form.bio || null,
        category: (form.category || null) as "enfermeiro" | "tecnico_enfermagem" | "medico" | "psicologo" | "fisioterapeuta" | "fonoaudiologo" | "nutricionista" | "terapeuta_ocupacional" | "cuidador" | "auxiliar_enfermagem" | null,
        council_number: form.council_number || null,
        preco_hora_cents: parseCurrencyToCents(form.preco),
        raio_atendimento_km: parseInt(form.raio, 10) || 0,
        atende_teleconsulta: form.atende_teleconsulta,
        aceita_novos_pacientes: form.aceita_novos_pacientes,
      })
      .eq("id", prof.id);

    setSaving(false);

    if (error) {
      showError("Não foi possível salvar o perfil.");
      return;
    }

    showSuccess("Perfil atualizado.");
    await onSaved();
  }

  if (!canEdit) {
    return (
      <View style={styles.card}>
        <ReadRow label="Telefone" value={prof.phone} icon="☎" />
        <ReadRow label="Registro" value={prof.council_number} icon="✓" />
        <ReadRow
          label="Área de atendimento"
          value={
            prof.city
              ? `${prof.city}${prof.state ? `/${prof.state}` : ""} · até ${prof.raio_atendimento_km} km`
              : null
          }
          icon="⌖"
        />
        <ReadRow
          label="Valor por hora"
          value={formatCents(prof.preco_hora_cents)}
          icon="★"
        />

        {prof.bio && (
          <View style={styles.aboutBox}>
            <Text style={styles.aboutLabel}>SOBRE</Text>
            <Text style={styles.aboutText}>{prof.bio}</Text>
          </View>
        )}
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <Field
        label="Nome completo"
        value={form.full_name}
        onChangeText={(value) =>
          setForm((f) => ({ ...f, full_name: value }))
        }
      />

      <Text style={styles.label}>Categoria</Text>
      <Pressable
        style={styles.input}
        onPress={() => setCategoryOpen(true)}
      >
        <Text style={form.category ? styles.inputText : styles.placeholder}>
          {form.category ? categoryLabel(form.category) : "Selecione"}
        </Text>
        <Text style={styles.chevron}>⌄</Text>
      </Pressable>

      <Modal
        visible={categoryOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setCategoryOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Categoria profissional</Text>

            <ScrollView>
              {CATEGORY_ORDER.map((category) => (
                <Pressable
                  key={category}
                  style={styles.option}
                  onPress={() => {
                    setForm((f) => ({ ...f, category }));
                    setCategoryOpen(false);
                  }}
                >
                  <Text style={styles.optionText}>
                    {categoryLabel(category)}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>

            <Pressable
              style={styles.cancelButton}
              onPress={() => setCategoryOpen(false)}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Field
        label={councilLabel(form.category || null)}
        value={form.council_number}
        onChangeText={(value) =>
          setForm((f) => ({ ...f, council_number: value }))
        }
        placeholder="000000"
      />

      <View style={styles.twoColumns}>
        <View style={styles.column}>
          <Field
            label="Telefone"
            value={form.phone}
            onChangeText={(value) =>
              setForm((f) => ({ ...f, phone: formatPhone(value) }))
            }
            keyboardType="phone-pad"
            placeholder="(00) 00000-0000"
          />
        </View>

        <View style={styles.column}>
          <Field
            label="Valor por hora (R$)"
            value={form.preco}
            onChangeText={(value) =>
              setForm((f) => ({ ...f, preco: value }))
            }
            keyboardType="decimal-pad"
            placeholder="120,00"
          />
        </View>
      </View>

      <View style={styles.twoColumns}>
        <View style={styles.cityColumn}>
          <Field
            label="Cidade"
            value={form.city}
            onChangeText={(value) =>
              setForm((f) => ({ ...f, city: value }))
            }
          />
        </View>

        <View style={styles.ufColumn}>
          <Field
            label="UF"
            value={form.state}
            onChangeText={(value) =>
              setForm((f) => ({
                ...f,
                state: value.toUpperCase().slice(0, 2),
              }))
            }
          />
        </View>
      </View>

      <Field
        label="Raio de atendimento (km)"
        value={form.raio}
        onChangeText={(value) =>
          setForm((f) => ({ ...f, raio: value }))
        }
        keyboardType="numeric"
      />

      <Field
        label="Sobre o profissional"
        value={form.bio}
        onChangeText={(value) =>
          setForm((f) => ({ ...f, bio: value }))
        }
        placeholder="Experiência, formações e diferenciais"
        multiline
      />

      <SwitchRow
        label="Atende teleconsulta"
        value={form.atende_teleconsulta}
        onValueChange={(value) =>
          setForm((f) => ({ ...f, atende_teleconsulta: value }))
        }
      />

      <SwitchRow
        label="Aceitando novos pacientes"
        value={form.aceita_novos_pacientes}
        onValueChange={(value) =>
          setForm((f) => ({ ...f, aceita_novos_pacientes: value }))
        }
      />

      <Pressable
        style={[styles.primaryButton, saving && styles.disabled]}
        onPress={() => void save()}
        disabled={saving}
      >
        {saving ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.primaryButtonText}>Salvar perfil</Text>
        )}
      </Pressable>
    </View>
  );
}

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = "default",
  multiline = false,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  keyboardType?: "default" | "phone-pad" | "decimal-pad" | "numeric";
  multiline?: boolean;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, multiline && styles.textarea]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        keyboardType={keyboardType}
        multiline={multiline}
        textAlignVertical={multiline ? "top" : "center"}
      />
    </View>
  );
}

function ReadRow({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string | null;
}) {
  return (
    <View style={styles.readRow}>
      <Text style={styles.readIcon}>{icon}</Text>
      <View style={styles.readContent}>
        <Text style={styles.readLabel}>{label}</Text>
        <Text style={styles.readValue} numberOfLines={2}>
          {value ?? "Não informado"}
        </Text>
      </View>
    </View>
  );
}

function SwitchRow({
  label,
  value,
  onValueChange,
}: {
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}) {
  return (
    <View style={styles.switchRow}>
      <Text style={styles.switchLabel}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: "#D1D5DB", true: colors.primary }}
      />
    </View>
  );
}

function EspecialidadesTab({
  profId,
  canEdit,
  catalogo,
  vinculos,
  onChanged,
}: {
  profId: string;
  canEdit: boolean;
  catalogo: Especialidade[];
  vinculos: Vinculo[];
  onChanged: () => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    especialidade_id: "",
    anos_experiencia: "0",
    preco: "",
    observacoes: "",
    is_primary: false,
  });

  const disponiveis = useMemo(
    () =>
      catalogo.filter(
        (c) =>
          !vinculos.some((v) => v.especialidade_id === c.id),
      ),
    [catalogo, vinculos],
  );

  async function add() {
    if (!form.especialidade_id) {
      showError("Selecione uma especialidade.");
      return;
    }

    setSaving(true);

    if (form.is_primary && vinculos.length > 0) {
      await supabase
        .from("profissional_especialidades")
        .update({ is_primary: false })
        .eq("profissional_id", profId);
    }

    const { error } = await supabase
      .from("profissional_especialidades")
      .insert({
        profissional_id: profId,
        especialidade_id: form.especialidade_id,
        anos_experiencia:
          parseInt(form.anos_experiencia, 10) || 0,
        preco_hora_cents: parseCurrencyToCents(form.preco),
        observacoes: form.observacoes || null,
        is_primary: form.is_primary || vinculos.length === 0,
      });

    setSaving(false);

    if (error) {
      showError("Não foi possível adicionar a especialidade.");
      return;
    }

    setOpen(false);
    setForm({
      especialidade_id: "",
      anos_experiencia: "0",
      preco: "",
      observacoes: "",
      is_primary: false,
    });

    showSuccess("Especialidade adicionada.");
    await onChanged();
  }

  async function setPrimary(id: string) {
    await supabase
      .from("profissional_especialidades")
      .update({ is_primary: false })
      .eq("profissional_id", profId);

    const { error } = await supabase
      .from("profissional_especialidades")
      .update({ is_primary: true })
      .eq("id", id);

    if (error) {
      showError("Não foi possível definir a especialidade principal.");
      return;
    }

    await onChanged();
  }

  async function remove(id: string) {
    const { error } = await supabase
      .from("profissional_especialidades")
      .delete()
      .eq("id", id);

    if (error) {
      showError("Não foi possível remover.");
      return;
    }

    showSuccess("Especialidade removida.");
    await onChanged();
  }

  return (
    <View style={styles.section}>
      {canEdit && (
        <Pressable
          style={styles.outlineButton}
          onPress={() => setOpen(true)}
        >
          <Text style={styles.outlineButtonText}>
            ＋ Adicionar especialidade
          </Text>
        </Pressable>
      )}

      {vinculos.length === 0 ? (
        <EmptyBox text="Nenhuma especialidade cadastrada." />
      ) : (
        vinculos.map((v) => (
          <View key={v.id} style={styles.itemCard}>
            <View style={styles.itemMain}>
              <View style={styles.itemTitleRow}>
                <Text style={styles.itemTitle} numberOfLines={2}>
                  {v.especialidade?.nome ?? "Especialidade"}
                </Text>

                {v.is_primary && (
                  <View style={styles.primaryBadge}>
                    <Text style={styles.primaryBadgeText}>
                      ★ Principal
                    </Text>
                  </View>
                )}
              </View>

              <Text style={styles.itemMeta}>
                {categoryLabel(v.especialidade?.categoria ?? null)} ·{" "}
                {v.anos_experiencia} ano
                {v.anos_experiencia !== 1 ? "s" : ""} de experiência ·{" "}
                {formatCents(v.preco_hora_cents)}/h
              </Text>

              {v.observacoes && (
                <Text style={styles.itemNotes}>{v.observacoes}</Text>
              )}
            </View>

            {canEdit && (
              <View style={styles.actions}>
                {!v.is_primary && (
                  <Pressable
                    style={styles.actionButton}
                    onPress={() => void setPrimary(v.id)}
                  >
                    <Text style={styles.actionText}>★</Text>
                  </Pressable>
                )}

                <Pressable
                  style={styles.actionButton}
                  onPress={() => void remove(v.id)}
                >
                  <Text style={styles.deleteText}>✕</Text>
                </Pressable>
              </View>
            )}
          </View>
        ))
      )}

      <Modal
        visible={open}
        transparent
        animationType="slide"
        onRequestClose={() => setOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>
              Adicionar especialidade
            </Text>

            <Text style={styles.label}>Especialidade</Text>

            <ScrollView style={styles.optionsList}>
              {disponiveis.map((c) => (
                <Pressable
                  key={c.id}
                  style={[
                    styles.option,
                    form.especialidade_id === c.id &&
                      styles.optionSelected,
                  ]}
                  onPress={() =>
                    setForm((f) => ({
                      ...f,
                      especialidade_id: c.id,
                    }))
                  }
                >
                  <Text style={styles.optionText}>{c.nome}</Text>
                </Pressable>
              ))}

              {disponiveis.length === 0 && (
                <Text style={styles.emptyText}>
                  Todas as especialidades já estão cadastradas.
                </Text>
              )}
            </ScrollView>

            <Field
              label="Anos de experiência"
              value={form.anos_experiencia}
              onChangeText={(value) =>
                setForm((f) => ({
                  ...f,
                  anos_experiencia: value,
                }))
              }
              keyboardType="numeric"
            />

            <Field
              label="Valor por hora (R$)"
              value={form.preco}
              onChangeText={(value) =>
                setForm((f) => ({ ...f, preco: value }))
              }
              keyboardType="decimal-pad"
              placeholder="150,00"
            />

            <Field
              label="Observações"
              value={form.observacoes}
              onChangeText={(value) =>
                setForm((f) => ({
                  ...f,
                  observacoes: value,
                }))
              }
              placeholder="Certificações, cursos ou restrições"
              multiline
            />

            <SwitchRow
              label="Definir como especialidade principal"
              value={form.is_primary}
              onValueChange={(value) =>
                setForm((f) => ({
                  ...f,
                  is_primary: value,
                }))
              }
            />

            <View style={styles.modalActions}>
              <Pressable
                style={styles.cancelButton}
                onPress={() => setOpen(false)}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </Pressable>

              <Pressable
                style={[styles.primaryButton, saving && styles.disabled]}
                onPress={() => void add()}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.primaryButtonText}>
                    Adicionar
                  </Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function AgendaTab({
  profId,
  canEdit,
  dispos,
  onChanged,
}: {
  profId: string;
  canEdit: boolean;
  dispos: Dispo[];
  onChanged: () => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    dia_semana: "1",
    hora_inicio: "08:00",
    hora_fim: "12:00",
    atende_domicilio: true,
    atende_teleconsulta: false,
  });

  async function add() {
    if (form.hora_fim <= form.hora_inicio) {
      showError("O horário final deve ser maior que o inicial.");
      return;
    }

    setSaving(true);

    const { error } = await supabase
      .from("disponibilidade_profissional")
      .insert({
        profissional_id: profId,
        dia_semana: parseInt(form.dia_semana, 10),
        hora_inicio: form.hora_inicio,
        hora_fim: form.hora_fim,
        atende_domicilio: form.atende_domicilio,
        atende_teleconsulta: form.atende_teleconsulta,
      });

    setSaving(false);

    if (error) {
      showError("Não foi possível salvar o horário.");
      return;
    }

    setOpen(false);
    showSuccess("Horário adicionado.");
    await onChanged();
  }

  async function toggleAtivo(d: Dispo) {
    const { error } = await supabase
      .from("disponibilidade_profissional")
      .update({ ativo: !d.ativo })
      .eq("id", d.id);

    if (error) {
      showError("Não foi possível atualizar o horário.");
      return;
    }

    await onChanged();
  }

  async function remove(id: string) {
    const { error } = await supabase
      .from("disponibilidade_profissional")
      .delete()
      .eq("id", id);

    if (error) {
      showError("Não foi possível remover o horário.");
      return;
    }

    await onChanged();
  }

  return (
    <View style={styles.section}>
      {canEdit && (
        <Pressable
          style={styles.outlineButton}
          onPress={() => setOpen(true)}
        >
          <Text style={styles.outlineButtonText}>
            ＋ Adicionar horário
          </Text>
        </Pressable>
      )}

      {dispos.length === 0 ? (
        <EmptyBox text="Nenhuma disponibilidade cadastrada." />
      ) : (
        WEEKDAYS.map((day) => {
          const items = dispos.filter(
            (d) => d.dia_semana === day.value,
          );

          if (items.length === 0) return null;

          return (
            <View key={day.value} style={styles.dayCard}>
              <Text style={styles.dayTitle}>{day.label}</Text>

              {items.map((d) => (
                <View key={d.id} style={styles.scheduleRow}>
                  <View style={styles.scheduleMain}>
                    <Text
                      style={[
                        styles.scheduleTime,
                        !d.ativo && styles.inactiveTime,
                      ]}
                    >
                      {shortTime(d.hora_inicio)} –{" "}
                      {shortTime(d.hora_fim)}
                    </Text>

                    <Text style={styles.scheduleMode}>
                      {[
                        d.atende_domicilio ? "Domicílio" : null,
                        d.atende_teleconsulta
                          ? "Teleconsulta"
                          : null,
                      ]
                        .filter(Boolean)
                        .join(" · ") ||
                        "Sem modalidade definida"}
                    </Text>
                  </View>

                  {canEdit && (
                    <View style={styles.scheduleActions}>
                      <Switch
                        value={d.ativo}
                        onValueChange={() => void toggleAtivo(d)}
                        trackColor={{
                          false: "#D1D5DB",
                          true: colors.primary,
                        }}
                        accessibilityLabel="Ativar horário"
                      />

                      <Pressable
                        style={styles.actionButton}
                        onPress={() => void remove(d.id)}
                      >
                        <Text style={styles.deleteText}>✕</Text>
                      </Pressable>
                    </View>
                  )}
                </View>
              ))}
            </View>
          );
        })
      )}

      <Modal
        visible={open}
        transparent
        animationType="slide"
        onRequestClose={() => setOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>
              Novo horário de disponibilidade
            </Text>

            <Text style={styles.label}>Dia da semana</Text>

            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.dayOptions}>
                {WEEKDAYS.map((d) => (
                  <Pressable
                    key={d.value}
                    style={[
                      styles.dayOption,
                      form.dia_semana === String(d.value) &&
                        styles.dayOptionSelected,
                    ]}
                    onPress={() =>
                      setForm((f) => ({
                        ...f,
                        dia_semana: String(d.value),
                      }))
                    }
                  >
                    <Text
                      style={[
                        styles.dayOptionText,
                        form.dia_semana === String(d.value) &&
                          styles.dayOptionTextSelected,
                      ]}
                    >
                      {d.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>

            <View style={styles.twoColumns}>
              <View style={styles.column}>
                <Field
                  label="Início"
                  value={form.hora_inicio}
                  onChangeText={(value) =>
                    setForm((f) => ({
                      ...f,
                      hora_inicio: value,
                    }))
                  }
                  placeholder="08:00"
                />
              </View>

              <View style={styles.column}>
                <Field
                  label="Fim"
                  value={form.hora_fim}
                  onChangeText={(value) =>
                    setForm((f) => ({
                      ...f,
                      hora_fim: value,
                    }))
                  }
                  placeholder="12:00"
                />
              </View>
            </View>

            <SwitchRow
              label="Atende em domicílio"
              value={form.atende_domicilio}
              onValueChange={(value) =>
                setForm((f) => ({
                  ...f,
                  atende_domicilio: value,
                }))
              }
            />

            <SwitchRow
              label="Atende teleconsulta"
              value={form.atende_teleconsulta}
              onValueChange={(value) =>
                setForm((f) => ({
                  ...f,
                  atende_teleconsulta: value,
                }))
              }
            />

            <View style={styles.modalActions}>
              <Pressable
                style={styles.cancelButton}
                onPress={() => setOpen(false)}
              >
                <Text style={styles.cancelButtonText}>
                  Cancelar
                </Text>
              </Pressable>

              <Pressable
                style={[styles.primaryButton, saving && styles.disabled]}
                onPress={() => void add()}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.primaryButtonText}>
                    Adicionar
                  </Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function EmptyBox({ text }: { text: string }) {
  return (
    <View style={styles.emptyBox}>
      <Text style={styles.emptyText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },

  content: {
    padding: 16,
    paddingBottom: 40,
  },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
  },

  centerContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: colors.background,
  },

  loadingText: {
    marginTop: 10,
    fontSize: 13,
    color: colors.textMuted,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  backIcon: {
    fontSize: 32,
    lineHeight: 34,
    color: colors.text,
  },

  headerText: {
    flex: 1,
  },

  title: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.text,
  },

  subtitle: {
    marginTop: 2,
    fontSize: 13,
    color: colors.textMuted,
  },

  profileCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 16,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 14,
  },

  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    backgroundColor: `${colors.primary}18`,
    marginRight: 12,
  },

  avatarImage: {
    width: "100%",
    height: "100%",
  },

  avatarText: {
    fontSize: 17,
    fontWeight: "800",
    color: colors.primary,
  },

  profileMain: {
    flex: 1,
  },

  profileName: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.text,
  },

  profileCategory: {
    marginTop: 3,
    fontSize: 12,
    color: colors.textMuted,
  },

  badges: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 9,
  },

  badge: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: `${colors.primary}15`,
  },

  badgeOutline: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D1D5DB",
  },

  badgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.primary,
  },

  badgeOutlineText: {
    color: colors.text,
  },

  tabs: {
    flexDirection: "row",
    padding: 4,
    borderRadius: 14,
    backgroundColor: "#E9EEF5",
    marginBottom: 14,
  },

  tabButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 40,
    borderRadius: 10,
    paddingHorizontal: 5,
  },

  tabButtonActive: {
    backgroundColor: colors.primary,
  },

  tabText: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.textMuted,
    textAlign: "center",
  },

  tabTextActive: {
    color: "#FFFFFF",
  },

  card: {
    padding: 16,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  field: {
    marginBottom: 12,
  },

  label: {
    marginBottom: 6,
    fontSize: 12,
    fontWeight: "600",
    color: colors.text,
  },

  input: {
    minHeight: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    color: colors.text,
    fontSize: 14,
    flexDirection: "row",
    alignItems: "center",
  },

  inputText: {
    flex: 1,
    color: colors.text,
    fontSize: 14,
  },

  placeholder: {
    flex: 1,
    color: colors.textMuted,
    fontSize: 14,
  },

  chevron: {
    fontSize: 18,
    color: colors.textMuted,
  },

  textarea: {
    minHeight: 90,
    paddingTop: 12,
  },

  twoColumns: {
    flexDirection: "row",
    gap: 10,
  },

  column: {
    flex: 1,
  },

  cityColumn: {
    flex: 2,
  },

  ufColumn: {
    flex: 1,
  },

  switchRow: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 12,
    marginBottom: 10,
  },

  switchLabel: {
    flex: 1,
    paddingRight: 12,
    fontSize: 13,
    color: colors.text,
  },

  primaryButton: {
    minHeight: 46,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    backgroundColor: colors.primary,
  },

  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },

  disabled: {
    opacity: 0.65,
  },

  outlineButton: {
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 11,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 14,
    marginBottom: 12,
  },

  outlineButtonText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: "700",
  },

  readRow: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 58,
    borderRadius: 10,
    backgroundColor: "#F5F7FA",
    paddingHorizontal: 12,
    marginBottom: 8,
  },

  readIcon: {
    width: 30,
    fontSize: 17,
    color: colors.primary,
  },

  readContent: {
    flex: 1,
  },

  readLabel: {
    fontSize: 11,
    color: colors.textMuted,
  },

  readValue: {
    marginTop: 2,
    fontSize: 13,
    fontWeight: "700",
    color: colors.text,
  },

  aboutBox: {
    marginTop: 4,
    borderRadius: 10,
    backgroundColor: "#F5F7FA",
    padding: 12,
  },

  aboutLabel: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.8,
    color: colors.textMuted,
  },

  aboutText: {
    marginTop: 5,
    fontSize: 13,
    lineHeight: 20,
    color: colors.text,
  },

  section: {
    gap: 2,
  },

  itemCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
    padding: 13,
    marginBottom: 9,
  },

  itemMain: {
    flex: 1,
  },

  itemTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 6,
  },

  itemTitle: {
    flexShrink: 1,
    fontSize: 14,
    fontWeight: "800",
    color: colors.text,
  },

  primaryBadge: {
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: `${colors.primary}15`,
  },

  primaryBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.primary,
  },

  itemMeta: {
    marginTop: 4,
    fontSize: 11,
    lineHeight: 17,
    color: colors.textMuted,
  },

  itemNotes: {
    marginTop: 5,
    fontSize: 11,
    lineHeight: 17,
    color: colors.textMuted,
  },

  actions: {
    flexDirection: "row",
    marginLeft: 8,
    gap: 4,
  },

  actionButton: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 9,
    backgroundColor: "#F5F7FA",
  },

  actionText: {
    fontSize: 17,
    color: colors.primary,
  },

  deleteText: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.danger,
  },

  emptyBox: {
    minHeight: 100,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#D1D5DB",
    backgroundColor: "#FFFFFF",
    padding: 20,
  },

  emptyTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.text,
    textAlign: "center",
  },

  emptyText: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: "center",
  },

  dayCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
    padding: 13,
    marginBottom: 9,
  },

  dayTitle: {
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
    color: colors.textMuted,
  },

  scheduleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 9,
  },

  scheduleMain: {
    flex: 1,
  },

  scheduleTime: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.text,
  },

  inactiveTime: {
    color: colors.textMuted,
    textDecorationLine: "line-through",
  },

  scheduleMode: {
    marginTop: 2,
    fontSize: 11,
    color: colors.textMuted,
  },

  scheduleActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.42)",
  },

  modal: {
    maxHeight: "92%",
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    backgroundColor: "#FFFFFF",
    padding: 18,
  },

  modalTitle: {
    marginBottom: 16,
    fontSize: 18,
    fontWeight: "800",
    color: colors.text,
  },

  optionsList: {
    maxHeight: 180,
    marginBottom: 12,
  },

  option: {
    minHeight: 44,
    justifyContent: "center",
    borderRadius: 9,
    paddingHorizontal: 12,
    marginBottom: 4,
  },

  optionSelected: {
    backgroundColor: `${colors.primary}15`,
  },

  optionText: {
    fontSize: 13,
    color: colors.text,
  },

  cancelButton: {
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 11,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    paddingHorizontal: 16,
    flex: 1,
  },

  cancelButtonText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.text,
  },

  modalActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 4,
  },

  dayOptions: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 14,
  },

  dayOption: {
    paddingHorizontal: 11,
    paddingVertical: 8,
    borderRadius: 9,
    backgroundColor: "#F5F7FA",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  dayOptionSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },

  dayOptionText: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.textMuted,
  },

  dayOptionTextSelected: {
    color: "#FFFFFF",
  },
});
