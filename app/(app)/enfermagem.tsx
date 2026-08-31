import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { useAuth } from "@/context/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { usePermissions } from "@/hooks/usePermissions";
import { PERMISSIONS } from "@/permissions/permissions";

type JsonPrimitive = string | number | boolean | null;
type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue };
type JsonObject = { [key: string]: JsonValue };

type SaeStatus =
  | "aberto"
  | "em_andamento"
  | "concluido"
  | "cancelado"
  | string;

type VitalSigns = {
  pa?: string;
  fc?: string;
  fr?: string;
  temp?: string;
  spo2?: string;
  dor?: string;
  glicemia?: string;
  peso?: string;
  altura?: string;

  // Compatibilidade com registros antigos
  temperatura?: string | number;
  pressao_arterial?: string;
  frequencia_cardiaca?: string | number;
  frequencia_respiratoria?: string | number;
  saturacao_o2?: string | number;
};

type Diagnostico = {
  id?: string;
  titulo?: string;
  relacionado_a?: string;
  evidenciado_por?: string;

  // Compatibilidade com registros antigos
  rel?: string;
  evidencias?: string;
};

type Intervencao = {
  id?: string;
  descricao?: string;
  frequencia?: string;
};

type Prescricao = {
  id?: string;
  item?: string;
  via?: string;
  horario?: string;
  observacao?: string;
  obs?: string;
  feito?: boolean;
};

type Evolucao = {
  id: string;
  created_at?: string;
  content?: string;
  evolution?: string;
  vital_signs?: VitalSigns;
  professional_id?: string;
};

type SaeRecord = {
  id: string;
  patient_id?: string;
  patient_name?: string;
  professional_id?: string;
  title?: string;
  titulo?: string;
  status: SaeStatus;
  historico?: JsonObject;
  vital_signs?: VitalSigns;
  diagnosticos?: Diagnostico[];
  planejamento?: Intervencao[];
  prescricoes?: Prescricao[];
  avaliacao?: string;
  opened_at?: string;
  closed_at?: string | null;
  created_at?: string;
  updated_at?: string;
};

type PatientOption = {
  id: string;
  full_name: string;
};

type SectionVersion = {
  id: string;
  sae_record_id?: string;
  section?: string;
  status?: "rascunho" | "publicada" | string;
  version_number?: number;
  payload?: JsonObject;
  note?: string | null;
  author_id?: string;
  created_at?: string;
};

const BLUE = "#2F80ED";
const GREEN = "#27AE60";
const RED = "#EB5757";
const BG = "#F5F7FA";
const CARD = "#FFFFFF";
const TEXT = "#333333";
const SECONDARY = "#666666";
const BORDER = "#E5E7EB";

function getErrorMessage(
  error: unknown,
  fallback: string = "Erro desconhecido.",
): string {
  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return error.message;
  }

  return fallback;
}

function Button({
  title,
  onPress,
  disabled,
  danger,
}: {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  danger?: boolean;
}) {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={[
        styles.button,
        danger ? styles.buttonDanger : styles.buttonPrimary,
        disabled && styles.disabled,
      ]}
    >
      <Text style={styles.buttonText}>{title}</Text>
    </Pressable>
  );
}

function Field({
  label,
  value,
  onChangeText,
  multiline,
  keyboardType,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  multiline?: boolean;
  keyboardType?: "default" | "numeric";
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        multiline={multiline}
        keyboardType={keyboardType}
        placeholder={label}
        placeholderTextColor="#999"
        style={[styles.input, multiline && styles.multiline]}
      />
    </View>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

export default function EnfermagemScreen() {
  const { user, loading: authLoading } = useAuth();
  const { can } = usePermissions();

  const canView = can(PERMISSIONS.SAE_VIEW);
  const canCreate = can(PERMISSIONS.SAE_CREATE);
  const canDelete = can(PERMISSIONS.SAE_DELETE);

  const [records, setRecords] = useState<SaeRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [newOpen, setNewOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [patientId, setPatientId] = useState("");
  const [search, setSearch] = useState("");
  const [patients, setPatients] = useState<PatientOption[]>([]);
  const [searching, setSearching] = useState(false);
  const [saving, setSaving] = useState(false);

  const [tab, setTab] = useState("coleta");

  const selectedRecord = useMemo(
    () => records.find((item) => item.id === selectedId) ?? null,
    [records, selectedId],
  );

  const load = useCallback(async () => {
    if (!user || !canView) return;

    setLoading(true);

    try {
      const { data, error } = await supabase
        .from("sae_records")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setRecords((data ?? []) as SaeRecord[]);

      if (!selectedId && data && data.length > 0) {
        setSelectedId(String(data[0].id));
      }
    } catch (error: unknown) {
      Alert.alert(
        "SAE",
        getErrorMessage(error),
      );
    } finally {
      setLoading(false);
    }
  }, [user, canView, selectedId]);

  useEffect(() => {
    load();
  }, [load]);

  const searchPatients = useCallback(async () => {
    const term = search.trim();

    if (!term) {
      setPatients([]);
      return;
    }

    setSearching(true);

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name")
        .ilike("full_name", `%${term}%`)
        .limit(20);

      if (error) throw error;

      setPatients((data ?? []) as PatientOption[]);
    } catch (error: unknown) {
      Alert.alert(
        "Paciente",
        getErrorMessage(error),
      );
    } finally {
      setSearching(false);
    }
  }, [search]);

  useEffect(() => {
    const timer = setTimeout(searchPatients, 350);
    return () => clearTimeout(timer);
  }, [searchPatients]);

  const createRecord = async () => {
    if (!canCreate) {
      Alert.alert(
        "SAE",
        "Você não tem permissão para criar uma nova SAE.",
      );
      return;
    }

    if (!patientId) {
      Alert.alert("SAE", "Selecione um paciente.");
      return;
    }

    setSaving(true);

    try {
      const payload = {
        patient_id: patientId,
        professional_id: user?.id ?? "",
        title: title.trim() || "SAE",
        status: "aberto" as const,
        historico: {},
        vital_signs: {},
        diagnosticos: [],
        planejamento: [],
        prescricoes: [],
        avaliacao: "",
      };

      const { data, error } = await supabase
        .from("sae_records")
        .insert(payload)
        .select("id")
        .single();

      if (error) throw error;

      setNewOpen(false);
      setTitle("");
      setSearch("");
      setPatientId("");
      setPatients([]);

      await load();

      if (data?.id) {
        setSelectedId(String(data.id));
      }
    } catch (error: unknown) {
      Alert.alert(
        "SAE",
        getErrorMessage(error, "Não foi possível criar a SAE."),
      );
    } finally {
      setSaving(false);
    }
  };

  const deleteRecord = async (record: SaeRecord) => {
    if (!canDelete) {
      Alert.alert(
        "SAE",
        "Você não tem permissão para excluir este registro.",
      );
      return;
    }

    Alert.alert(
      "Excluir SAE",
      "Deseja realmente excluir este registro?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            try {
              const { error } = await supabase
                .from("sae_records")
                .delete()
                .eq("id", record.id);

              if (error) throw error;

              if (selectedId === record.id) {
                setSelectedId(null);
              }

              await load();
            } catch (error: unknown) {
              Alert.alert(
                "SAE",
                getErrorMessage(error),
              );
            }
          },
        },
      ],
    );
  };

  if (authLoading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color={BLUE} />
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={styles.emptyTitle}>Sessão necessária</Text>
        <Text style={styles.emptyText}>
          Entre no ZELAR+ para acessar a SAE.
        </Text>
      </SafeAreaView>
    );
  }

  if (!canView) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={styles.emptyTitle}>Acesso restrito</Text>
        <Text style={styles.emptyText}>
          Você não tem permissão para visualizar a SAE.
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Enfermagem / SAE</Text>
            <Text style={styles.subtitle}>
              Sistematização da Assistência de Enfermagem
            </Text>
          </View>

          {canCreate && (
            <Button
              title="+ Nova SAE"
              onPress={() => setNewOpen(true)}
            />
          )}
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryNumber}>{records.length}</Text>
          <Text style={styles.summaryLabel}>registros SAE</Text>
        </View>

        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator color={BLUE} />
            <Text style={styles.secondary}>Carregando registros...</Text>
          </View>
        ) : records.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>Nenhuma SAE encontrada</Text>
            <Text style={styles.emptyText}>
              Crie o primeiro registro para iniciar a assistência de
              enfermagem.
            </Text>
            {canCreate && (
              <Button
                title="Criar primeira SAE"
                onPress={() => setNewOpen(true)}
              />
            )}
          </View>
        ) : (
          <View>
            <Text style={styles.listTitle}>Registros</Text>

            {records.map((record) => (
              <Pressable
                key={record.id}
                onPress={() => setSelectedId(record.id)}
                style={[
                  styles.recordCard,
                  selectedId === record.id && styles.recordSelected,
                ]}
              >
                <View style={styles.recordHeader}>
                  <Text style={styles.recordTitle}>
                    {record.title ?? record.titulo ?? "SAE"}
                  </Text>

                  <View style={styles.statusBadge}>
                    <Text style={styles.statusText}>
                      {record.status ?? "aberto"}
                    </Text>
                  </View>
                </View>

                <Text style={styles.secondary}>
                  Paciente: {record.patient_name ?? record.patient_id ?? "—"}
                </Text>

                <Text style={styles.secondary}>
                  {record.created_at
                    ? new Date(record.created_at).toLocaleString("pt-BR")
                    : "Data não informada"}
                </Text>
              </Pressable>
            ))}
          </View>
        )}

        {selectedRecord && (
          <SaeEditor
            key={selectedRecord.id}
            record={selectedRecord}
            tab={tab}
            setTab={setTab}
            onReload={load}
            onDelete={() => deleteRecord(selectedRecord)}
          />
        )}
      </ScrollView>

      <Modal
        visible={newOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setNewOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <ScrollView keyboardShouldPersistTaps="handled">
              <Text style={styles.modalTitle}>Nova SAE</Text>

              <Field
                label="Título"
                value={title}
                onChangeText={setTitle}
              />

              <Field
                label="Pesquisar paciente"
                value={search}
                onChangeText={setSearch}
              />

              {searching && (
                <ActivityIndicator
                  style={styles.searchLoader}
                  color={BLUE}
                />
              )}

              {patients.map((patient) => (
                <Pressable
                  key={patient.id}
                  onPress={() => {
                    setPatientId(patient.id);
                    setSearch(patient.full_name);
                    setPatients([]);
                  }}
                  style={[
                    styles.patientOption,
                    patientId === patient.id && styles.patientSelected,
                  ]}
                >
                  <Text style={styles.patientName}>
                    {patient.full_name}
                  </Text>
                </Pressable>
              ))}

              <View style={styles.modalActions}>
                <Button
                  title="Cancelar"
                  onPress={() => setNewOpen(false)}
                />

                <Button
                  title={saving ? "Salvando..." : "Criar SAE"}
                  onPress={createRecord}
                  disabled={saving}
                />
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function SaeEditor({
  record,
  tab,
  setTab,
  onReload,
  onDelete,
}: {
  record: SaeRecord;
  tab: string;
  setTab: (value: string) => void;
  onReload: () => Promise<void>;
  onDelete: () => void;
}) {
  const { user } = useAuth();
  const { can } = usePermissions();

  /*
   * RBAC + regra de propriedade:
   *
   * - SAE_VIEW: pode visualizar a SAE.
   * - SAE_EDIT: possui permissão de edição.
   * - Profissional comum somente edita a própria SAE.
   * - Admin possui SAE_EDIT pelo ROLE_PERMISSIONS e pode atuar
   *   administrativamente sobre registros.
   *
   * A autorização definitiva continua sendo reforçada pelo RLS
   * do Supabase.
   */
  const canView = can(PERMISSIONS.SAE_VIEW);
  const canCreate = can(PERMISSIONS.SAE_CREATE);
  const canEditPermission = can(PERMISSIONS.SAE_EDIT);
  const canDelete = can(PERMISSIONS.SAE_DELETE);
  const canEvolutionPermission = can(PERMISSIONS.SAE_EVOLUTION);
  const canVersionPermission = can(PERMISSIONS.SAE_VERSION);

  const isOwner =
    !!user?.id &&
    record.professional_id === user.id;

  const canEdit =
    canEditPermission &&
    (isOwner || canDelete);

  const canEvolution =
    canEvolutionPermission &&
    (isOwner || canDelete);

  const canVersion =
    canVersionPermission &&
    (isOwner || canDelete);

  if (!canView) {
    return (
      <View style={styles.emptyCard}>
        <Text style={styles.emptyTitle}>Acesso restrito</Text>
        <Text style={styles.emptyText}>
          Você não tem permissão para visualizar esta SAE.
        </Text>
      </View>
    );
  }

  const [historico, setHistorico] = useState<JsonObject>(
    record.historico ?? {},
  );

  const [vital, setVital] = useState<VitalSigns>(
    record.vital_signs ?? {},
  );

  const [diagnosticos, setDiagnosticos] = useState<Diagnostico[]>(
    (record.diagnosticos ?? []).map((item) => ({
      ...item,
      relacionado_a: item.relacionado_a ?? item.rel,
      evidenciado_por: item.evidenciado_por ?? item.evidencias,
    })),
  );

  const [planejamento, setPlanejamento] = useState<Intervencao[]>(
    record.planejamento ?? [],
  );

  const [prescricoes, setPrescricoes] = useState<Prescricao[]>(
    (record.prescricoes ?? []).map((item) => ({
      ...item,
      observacao: item.observacao ?? item.obs,
      obs: item.obs ?? item.observacao,
      feito: typeof item.feito === "boolean" ? item.feito : false,
    })),
  );

  const [avaliacao, setAvaliacao] = useState(record.avaliacao ?? "");
  const [status, setStatus] = useState<SaeStatus>(record.status);
  const [saving, setSaving] = useState(false);

  const [evolutions, setEvolutions] = useState<Evolucao[]>([]);
  const [loadingEv, setLoadingEv] = useState(false);
  const [evOpen, setEvOpen] = useState(false);

  const [evContent, setEvContent] = useState("");
  const [evVital, setEvVital] = useState<VitalSigns>({});
  const [savingEv, setSavingEv] = useState(false);

  const [versions, setVersions] = useState<SectionVersion[]>([]);
  const [loadingVersions, setLoadingVersions] = useState(false);
  const [versionOpen, setVersionOpen] = useState(false);
  const [versionNote, setVersionNote] = useState("");
  const [restoringVersion, setRestoringVersion] = useState<string | null>(null);

  const [diagTitle, setDiagTitle] = useState("");
  const [diagRel, setDiagRel] = useState("");
  const [diagEvidence, setDiagEvidence] = useState("");

  const [interventionDesc, setInterventionDesc] = useState("");
  const [interventionFreq, setInterventionFreq] = useState("");

  const [prescriptionItem, setPrescriptionItem] = useState("");
  const [prescriptionVia, setPrescriptionVia] = useState("");
  const [prescriptionTime, setPrescriptionTime] = useState("");
  const [prescriptionObs, setPrescriptionObs] = useState("");

  const loadEvolutions = useCallback(async () => {
    setLoadingEv(true);

    try {
      const { data, error } = await supabase
        .from("sae_evolutions")
        .select("*")
        .eq("sae_record_id", record.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setEvolutions((data ?? []) as Evolucao[]);
    } catch (error: unknown) {
      Alert.alert(
        "Evoluções",
        getErrorMessage(error, "Não foi possível carregar as evoluções."),
      );
    } finally {
      setLoadingEv(false);
    }
  }, [record.id]);

  const loadVersions = useCallback(async () => {
    setLoadingVersions(true);

    try {
      const { data, error } = await supabase
        .from("sae_section_versions")
        .select("*")
        .eq("sae_record_id", record.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setVersions((data ?? []) as SectionVersion[]);
    } catch (error: unknown) {
      Alert.alert(
        "Versões",
        getErrorMessage(error, "Não foi possível carregar as versões."),
      );
    } finally {
      setLoadingVersions(false);
    }
  }, [record.id]);

  useEffect(() => {
    loadEvolutions();
    loadVersions();
  }, [loadEvolutions, loadVersions]);

  const save = async () => {
    if (!canEdit) {
      Alert.alert(
        "SAE",
        "Você não tem permissão para editar este processo."
      );
      return;
    }

    setSaving(true);

    try {
      const payload: Record<string, unknown> = {
        historico,
        vital_signs: vital,
        diagnosticos,
        planejamento,
        prescricoes,
        avaliacao,
        status,
      };

      if (status === "concluido" && !record.closed_at) {
        payload.closed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from("sae_records")
        .update(payload as never)
        .eq("id", record.id);

      if (error) throw error;

      Alert.alert("SAE", "Registro salvo com sucesso.");
      await onReload();
    } catch (error: unknown) {
      Alert.alert(
        "SAE",
        getErrorMessage(error),
      );
    } finally {
      setSaving(false);
    }
  };

  const addDiagnostico = () => {
    if (!canEdit) {
      Alert.alert(
        "Diagnóstico",
        "Você não tem permissão para alterar esta SAE.",
      );
      return;
    }

    if (!diagTitle.trim()) return;

    setDiagnosticos((current) => [
      ...current,
      {
        id: `${Date.now()}`,
        titulo: diagTitle.trim(),
        relacionado_a: diagRel.trim(),
        evidenciado_por: diagEvidence.trim(),

        // Compatibilidade com registros antigos
        rel: diagRel.trim(),
        evidencias: diagEvidence.trim(),
      },
    ]);

    setDiagTitle("");
    setDiagRel("");
    setDiagEvidence("");
  };

  const addIntervention = () => {
    if (!canEdit) {
      Alert.alert(
        "Planejamento",
        "Você não tem permissão para alterar esta SAE.",
      );
      return;
    }

    if (!interventionDesc.trim()) return;

    setPlanejamento((current) => [
      ...current,
      {
        id: `${Date.now()}`,
        descricao: interventionDesc.trim(),
        frequencia: interventionFreq.trim(),
      },
    ]);

    setInterventionDesc("");
    setInterventionFreq("");
  };

  const addPrescription = () => {
    if (!canEdit) {
      Alert.alert(
        "Prescrição",
        "Você não tem permissão para alterar esta SAE.",
      );
      return;
    }

    if (!prescriptionItem.trim()) return;

    setPrescricoes((current) => [
      ...current,
      {
        id: `${Date.now()}`,
        item: prescriptionItem.trim(),
        via: prescriptionVia.trim(),
        horario: prescriptionTime.trim(),
        observacao: prescriptionObs.trim(),
        obs: prescriptionObs.trim(),
        feito: false,
      },
    ]);

    setPrescriptionItem("");
    setPrescriptionVia("");
    setPrescriptionTime("");
    setPrescriptionObs("");
  };

  const saveEvolution = async () => {
    if (!canEvolution) {
      Alert.alert(
        "Evolução",
        "Você não tem permissão para registrar evolução neste processo."
      );
      return;
    }

    if (!evContent.trim()) {
      Alert.alert("Evolução", "Informe o conteúdo da evolução.");
      return;
    }

    setSavingEv(true);

    try {
      const patientId = record.patient_id;
      const professionalId = user?.id;

      if (!patientId) {
        Alert.alert("Erro", "A SAE não possui paciente vinculado.");
        return;
      }

      if (!professionalId) {
        Alert.alert("Erro", "Não foi possível identificar o profissional.");
        return;
      }

      const { error } = await supabase.from("sae_evolutions").insert({
        sae_record_id: record.id,
        patient_id: patientId,
        professional_id: professionalId,
        content: evContent.trim(),
        vital_signs: evVital,
      });

      if (error) throw error;

      try {
        await supabase.from("health_records").insert({
          patient_id: patientId,
          author_id: professionalId,
          category: "evolucao",
          title: "Evolução de Enfermagem — SAE",
          content: evContent.trim(),
          data: {
            sae_record_id: record.id,
            vital_signs: evVital,
          },
        });
      } catch {
        // O registro principal já foi salvo.
      }

      setEvContent("");
      setEvVital({});
      setEvOpen(false);

      await loadEvolutions();

      Alert.alert("Evolução", "Evolução registrada.");
    } catch (error: unknown) {
      Alert.alert(
        "Evolução",
        getErrorMessage(error, "Não foi possível registrar a evolução."),
      );
    } finally {
      setSavingEv(false);
    }
  };

  const publishSection = async (
    section:
      | "coleta"
      | "diagnosticos"
      | "planejamento"
      | "prescricoes"
      | "avaliacao",
    content: JsonObject,
    versionStatus: "rascunho" | "publicada",
  ) => {
    if (!canVersion) {
      Alert.alert(
        "Versão",
        "Você não tem permissão para criar ou publicar versões desta SAE.",
      );
      return;
    }

    try {
      const authorId = user?.id;

      if (!authorId) {
        Alert.alert(
          "Versão",
          "Não foi possível identificar o profissional responsável pela SAE.",
        );
        return;
      }

      if (versionStatus === "publicada") {
        const patch: Record<string, unknown> = {
          [section]: content[section],
        };

        const { error: recordError } = await supabase
          .from("sae_records")
          .update(patch as never)
          .eq("id", record.id);

        if (recordError) throw recordError;
      }

      const { data: existingVersions, error: versionsError } = await supabase
        .from("sae_section_versions")
        .select("version_number")
        .eq("sae_record_id", record.id)
        .eq("section", section)
        .eq("status", versionStatus)
        .order("version_number", { ascending: false })
        .limit(1);

      if (versionsError) throw versionsError;

      const lastVersion =
        existingVersions?.[0]?.version_number;

      const versionNumber =
        typeof lastVersion === "number"
          ? lastVersion + 1
          : 1;

      const { error } = await supabase
        .from("sae_section_versions")
        .insert({
          sae_record_id: record.id,
          section,
          payload: content,
          author_id: authorId,
          status: versionStatus,
          version_number: versionNumber,
          note: versionNote.trim() || null,
        } as never);

      if (error) throw error;

      setVersionNote("");
      await loadVersions();

      Alert.alert(
        "Versão",
        versionStatus === "publicada"
          ? `Versão v${versionNumber} publicada.`
          : `Rascunho v${versionNumber} salvo.`,
      );
    } catch (error: unknown) {
      Alert.alert(
        "Versão",
        getErrorMessage(error, "Não foi possível salvar a versão."),
      );
    }
  };

  const restoreVersion = async (version: SectionVersion) => {
    if (!canEdit) {
      Alert.alert(
        "Versão",
        "Você não tem permissão para restaurar esta versão.",
      );
      return;
    }

    if (!version.payload) {
      Alert.alert(
        "Versão",
        "Esta versão não possui conteúdo para restauração.",
      );
      return;
    }

    setRestoringVersion(version.id);

    try {
      const payload = version.payload;

      if (version.section === "coleta") {
        if (payload.historico) {
          setHistorico(payload.historico as JsonObject);
        }

        if (payload.vital_signs) {
          setVital((payload.vital_signs as VitalSigns) ?? {});
        }
      }

      if (version.section === "diagnosticos") {
        setDiagnosticos(
          (payload.diagnosticos as Diagnostico[]) ?? [],
        );
      }

      if (version.section === "planejamento") {
        setPlanejamento(
          (payload.planejamento as Intervencao[]) ?? [],
        );
      }

      if (version.section === "prescricoes") {
        setPrescricoes(
          ((payload.prescricoes as Prescricao[]) ?? []).map((item) => ({
            ...item,
            observacao: item.observacao ?? item.obs,
            obs: item.obs ?? item.observacao,
            feito:
              typeof item.feito === "boolean"
                ? item.feito
                : false,
          })),
        );
      }

      if (version.section === "avaliacao") {
        setAvaliacao(
          ((payload.avaliacao as string | null) ?? "") || "",
        );
      }

      Alert.alert(
        "Versão restaurada",
        `v${version.version_number ?? "—"} restaurada nos editores. Revise o conteúdo e salve a SAE.`,
      );
    } catch (error: unknown) {
      Alert.alert(
        "Versão",
        getErrorMessage(
          error,
          "Não foi possível restaurar esta versão.",
        ),
      );
    } finally {
      setRestoringVersion(null);
    }
  };

  const deleteVersion = async (version: SectionVersion) => {
    if (!canEdit) {
      Alert.alert(
        "Versão",
        "Você não tem permissão para excluir versões.",
      );
      return;
    }

    if (version.author_id !== record.professional_id) {
      Alert.alert(
        "Versão",
        "Somente o autor da versão pode excluí-la.",
      );
      return;
    }

    Alert.alert(
      "Excluir versão",
      `Deseja excluir a versão v${version.version_number ?? "—"}?`,
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            try {
              const { error } = await supabase
                .from("sae_section_versions")
                .delete()
                .eq("id", version.id);

              if (error) throw error;

              await loadVersions();

              Alert.alert(
                "Versão",
                "Versão excluída com sucesso.",
              );
            } catch (error: unknown) {
              Alert.alert(
                "Versão",
                getErrorMessage(
                  error,
                  "Não foi possível excluir a versão.",
                ),
              );
            }
          },
        },
      ],
    );
  };

  return (
    <View style={styles.editor}>
      <View style={styles.editorHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.editorTitle}>
            {record.title ?? record.titulo ?? "SAE"}
          </Text>

          <Text style={styles.secondary}>
            Paciente: {record.patient_name ?? record.patient_id ?? "—"}
          </Text>
        </View>

        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>{status}</Text>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabs}
      >
        {[
          ["coleta", "Coleta"],
          ["diagnosticos", "Diagnósticos"],
          ["planejamento", "Planejamento"],
          ["prescricoes", "Prescrições"],
          ["avaliacao", "Avaliação"],
          ["evolucoes", "Evoluções"],
          ["versoes", "Versões"],
        ].map(([value, label]) => (
          <Pressable
            key={value}
            onPress={() => setTab(value)}
            style={[styles.tab, tab === value && styles.tabActive]}
          >
            <Text
              style={[
                styles.tabText,
                tab === value && styles.tabTextActive,
              ]}
            >
              {label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {tab === "coleta" && (
        <View>
          <Section title="Histórico">
            <Field
              label="Observações / histórico"
              value={String(historico.observacoes ?? "")}
              onChangeText={(value) =>
                setHistorico((current) => ({
                  ...current,
                  observacoes: value,
                }))
              }
              multiline
            />
          </Section>

          <Section title="Sinais vitais">
            <Field
              label="Temperatura"
              value={String(vital.temp ?? "")}
              onChangeText={(value) =>
                setVital((current) => ({
                  ...current,
                  temp: value,
                }))
              }
              keyboardType="numeric"
            />

            <Field
              label="Pressão arterial"
              value={String(vital.pa ?? "")}
              onChangeText={(value) =>
                setVital((current) => ({
                  ...current,
                  pa: value,
                }))
              }
            />

            <Field
              label="Frequência cardíaca"
              value={String(vital.fc ?? "")}
              onChangeText={(value) =>
                setVital((current) => ({
                  ...current,
                  fc: value,
                }))
              }
              keyboardType="numeric"
            />

            <Field
              label="Frequência respiratória"
              value={String(vital.fr ?? "")}
              onChangeText={(value) =>
                setVital((current) => ({
                  ...current,
                  fr: value,
                }))
              }
              keyboardType="numeric"
            />

            <Field
              label="Saturação O₂"
              value={String(vital.spo2 ?? "")}
              onChangeText={(value) =>
                setVital((current) => ({
                  ...current,
                  spo2: value,
                }))
              }
              keyboardType="numeric"
            />

            <Field
              label="Glicemia"
              value={String(vital.glicemia ?? "")}
              onChangeText={(value) =>
                setVital((current) => ({
                  ...current,
                  glicemia: value,
                }))
              }
              keyboardType="numeric"
            />

            <Field
              label="Dor"
              value={String(vital.dor ?? "")}
              onChangeText={(value) =>
                setVital((current) => ({
                  ...current,
                  dor: value,
                }))
              }
              keyboardType="numeric"
            />
          </Section>
        </View>
      )}

      {tab === "diagnosticos" && (
        <Section title="Diagnósticos de enfermagem">
          <Field
            label="Diagnóstico"
            value={diagTitle}
            onChangeText={setDiagTitle}
          />

          <Field
            label="Relação / fatores relacionados"
            value={diagRel}
            onChangeText={setDiagRel}
            multiline
          />

          <Field
            label="Evidências"
            value={diagEvidence}
            onChangeText={setDiagEvidence}
            multiline
          />

          <Button
            title="Adicionar diagnóstico"
            onPress={addDiagnostico}
            disabled={!canEdit}
          />

          {diagnosticos.map((item, index) => (
            <View key={item.id ?? index} style={styles.itemCard}>
              <Text style={styles.itemTitle}>
                {item.titulo ?? "Diagnóstico"}
              </Text>

              {!!(item.relacionado_a ?? item.rel) && (
                <Text style={styles.secondary}>
                  Relacionado a: {item.relacionado_a ?? item.rel}
                </Text>
              )}

              {!!(item.evidenciado_por ?? item.evidencias) && (
                <Text style={styles.secondary}>
                  Evidenciado por:{" "}
                  {item.evidenciado_por ?? item.evidencias}
                </Text>
              )}

              {canEdit && (
                <Pressable
                  onPress={() =>
                    setDiagnosticos((current) =>
                      current.filter((_, i) => i !== index),
                    )
                  }
                >
                  <Text style={styles.deleteText}>Remover</Text>
                </Pressable>
              )}
            </View>
          ))}
        </Section>
      )}

      {tab === "planejamento" && (
        <Section title="Planejamento / intervenções">
          <Field
            label="Intervenção"
            value={interventionDesc}
            onChangeText={setInterventionDesc}
            multiline
          />

          <Field
            label="Frequência"
            value={interventionFreq}
            onChangeText={setInterventionFreq}
          />

          <Button
            title="Adicionar intervenção"
            onPress={addIntervention}
            disabled={!canEdit}
          />

          {planejamento.map((item, index) => (
            <View key={item.id ?? index} style={styles.itemCard}>
              <Text style={styles.itemTitle}>
                {item.descricao ?? "Intervenção"}
              </Text>

              {!!item.frequencia && (
                <Text style={styles.secondary}>
                  Frequência: {item.frequencia}
                </Text>
              )}

              {canEdit && (
                <Pressable
                  onPress={() =>
                    setPlanejamento((current) =>
                      current.filter((_, i) => i !== index),
                    )
                  }
                >
                  <Text style={styles.deleteText}>Remover</Text>
                </Pressable>
              )}
            </View>
          ))}
        </Section>
      )}

      {tab === "prescricoes" && (
        <Section title="Prescrições">
          <Field
            label="Item"
            value={prescriptionItem}
            onChangeText={setPrescriptionItem}
          />

          <Field
            label="Via"
            value={prescriptionVia}
            onChangeText={setPrescriptionVia}
          />

          <Field
            label="Horário"
            value={prescriptionTime}
            onChangeText={setPrescriptionTime}
          />

          <Field
            label="Observações"
            value={prescriptionObs}
            onChangeText={setPrescriptionObs}
            multiline
          />

          <Button
            title="Adicionar prescrição"
            onPress={addPrescription}
            disabled={!canEdit}
          />

          {prescricoes.map((item, index) => (
            <View key={item.id ?? index} style={styles.itemCard}>
              <Text style={styles.itemTitle}>
                {item.item ?? "Prescrição"}
              </Text>

              <Text style={styles.secondary}>
                Via: {item.via || "—"} | Horário: {item.horario || "—"}
              </Text>

              {!!(item.observacao ?? item.obs) && (
                <Text style={styles.secondary}>
                  {item.observacao ?? item.obs}
                </Text>
              )}

              {typeof item.feito === "boolean" && (
                <Text style={styles.secondary}>
                  Status: {item.feito ? "Realizado" : "Pendente"}
                </Text>
              )}

              {canEdit && (
                <Pressable
                  onPress={() =>
                    setPrescricoes((current) =>
                      current.filter((_, i) => i !== index),
                    )
                  }
                >
                  <Text style={styles.deleteText}>Remover</Text>
                </Pressable>
              )}
            </View>
          ))}
        </Section>
      )}

      {tab === "avaliacao" && (
        <Section title="Avaliação">
          <Field
            label="Avaliação de enfermagem"
            value={avaliacao}
            onChangeText={setAvaliacao}
            multiline
          />

          <Text style={styles.label}>Status</Text>

          <View style={styles.statusRow}>
            {[
              "aberto",
              "em_andamento",
              "concluido",
              "cancelado",
            ].map((value) => (
              <Pressable
                key={value}
                onPress={async () => {
                  if (!canEdit) {
                    Alert.alert(
                      "SAE",
                      "Você não tem permissão para alterar o status."
                    );
                    return;
                  }

                  const next = value as SaeStatus;

                  setStatus(next);
                  setSaving(true);

                  const patch: Record<string, unknown> = {
                    status: next,
                  };

                  if (
                    next === "concluido" &&
                    !record.closed_at
                  ) {
                    patch.closed_at =
                      new Date().toISOString();
                  }

                  const { error } = await supabase
                    .from("sae_records")
                    .update(patch as never)
                    .eq("id", record.id);

                  setSaving(false);

                  if (error) {
                    Alert.alert(
                      "SAE",
                      error.message
                    );
                    setStatus(record.status);
                    return;
                  }

                  await onReload();
                }}
                style={[
                  styles.statusChoice,
                  status === value && styles.statusChoiceActive,
                ]}
              >
                <Text
                  style={[
                    styles.statusChoiceText,
                    status === value &&
                      styles.statusChoiceTextActive,
                  ]}
                >
                  {value}
                </Text>
              </Pressable>
            ))}
          </View>
        </Section>
      )}

      {tab === "evolucoes" && (
        <Section title="Evoluções">
          <Button
            title="+ Nova evolução"
            onPress={() => {
              if (!canEdit) {
                Alert.alert(
                  "SAE",
                  "Você não tem permissão para adicionar uma evolução.",
                );
                return;
              }

              setEvOpen(true);
            }}
            disabled={!canEdit}
          />

          {loadingEv ? (
            <ActivityIndicator color={BLUE} />
          ) : evolutions.length === 0 ? (
            <Text style={styles.secondary}>
              Nenhuma evolução registrada.
            </Text>
          ) : (
            evolutions.map((item) => (
              <View key={item.id} style={styles.itemCard}>
                <Text style={styles.itemTitle}>
                  {item.created_at
                    ? new Date(item.created_at).toLocaleString("pt-BR")
                    : "Evolução"}
                </Text>

                <Text style={styles.secondary}>
                  {item.content ?? item.evolution ?? "—"}
                </Text>

                {item.vital_signs && (
                  <Text style={styles.secondary}>
                    Sinais vitais:{" "}
                    {JSON.stringify(item.vital_signs)}
                  </Text>
                )}
              </View>
            ))
          )}
        </Section>
      )}

      {tab === "versoes" && (
        <Section title="Versões da SAE">
          <View style={styles.itemCard}>
            <Text style={styles.itemTitle}>
              Histórico de versões
            </Text>

            <Text style={styles.secondary}>
              Rascunhos e versões publicadas desta SAE.
            </Text>

            {canEdit && (
              <>
                <TextInput
                  value={versionNote}
                  onChangeText={setVersionNote}
                  placeholder="Nota da versão (opcional)"
                  placeholderTextColor={SECONDARY}
                  style={styles.input}
                />

                <Button
                  title={
                    versionOpen
                      ? "Fechar criação de versão"
                      : "+ Nova versão"
                  }
                  onPress={() => setVersionOpen((value) => !value)}
                  disabled={!canEdit}
                />

                {versionOpen && (
                  <View style={{ marginTop: 8 }}>
                    <Button
                      title="Salvar rascunho"
                      onPress={() => {
                        publishSection(
                          "coleta",
                          {
                            historico,
                            vital_signs: vital,
                          },
                          "rascunho",
                        );
                      }}
                      disabled={!canEdit}
                    />

                    <View style={{ height: 8 }} />

                    <Button
                      title="Publicar versão"
                      onPress={() => {
                        publishSection(
                          "coleta",
                          {
                            historico,
                            vital_signs: vital,
                          },
                          "publicada",
                        );
                      }}
                      disabled={!canEdit}
                    />
                  </View>
                )}
              </>
            )}
          </View>

          {loadingVersions ? (
            <ActivityIndicator color={BLUE} />
          ) : versions.length === 0 ? (
            <Text style={styles.secondary}>
              Nenhuma versão registrada.
            </Text>
          ) : (
            versions.map((version) => (
              <View key={version.id} style={styles.itemCard}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Text style={[styles.itemTitle, { flex: 1 }]}>
                    {version.section ?? "Seção"}
                    {typeof version.version_number === "number"
                      ? ` · v${version.version_number}`
                      : ""}
                  </Text>

                  {version.status === "publicada" ? (
                    <Text style={{ color: GREEN, fontWeight: "700" }}>
                      Publicada
                    </Text>
                  ) : (
                    <Text style={{ color: "#B7791F", fontWeight: "700" }}>
                      Rascunho
                    </Text>
                  )}
                </View>

                {!!version.created_at && (
                  <Text style={styles.secondary}>
                    {new Date(version.created_at).toLocaleString(
                      "pt-BR",
                    )}
                  </Text>
                )}

                {!!version.note && (
                  <Text style={styles.secondary}>
                    Nota: {version.note}
                  </Text>
                )}

                <Text
                  style={[
                    styles.secondary,
                    { marginTop: 6 },
                  ]}
                >
                  Autor:{" "}
                  {version.author_id === record.professional_id
                    ? "Profissional responsável"
                    : version.author_id ?? "—"}
                </Text>

                {canEdit && (
                  <>
                    <View style={{ height: 8 }} />

                    <Button
                      title={
                        restoringVersion === version.id
                          ? "Restaurando..."
                          : "Restaurar nos editores"
                      }
                      onPress={() => restoreVersion(version)}
                      disabled={
                        restoringVersion !== null ||
                        !version.payload
                      }
                    />

                    <View style={{ height: 8 }} />

                    <Button
                      title="Excluir versão"
                      onPress={() => deleteVersion(version)}
                      disabled={
                        version.author_id !== record.professional_id
                      }
                      danger
                    />
                  </>
                )}
              </View>
            ))
          )}
        </Section>
      )}

      <View style={styles.saveArea}>
        <Button
          title={saving ? "Salvando..." : "Salvar SAE"}
          onPress={save}
          disabled={saving}
        />

        <Button
          title="Excluir SAE"
          onPress={() => {
            if (!canEdit) {
              Alert.alert(
                "SAE",
                "Você não tem permissão para excluir este processo."
              );
              return;
            }

            onDelete();
          }}
          danger
        />
      </View>

      <Modal
        visible={evOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setEvOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <ScrollView>
              <Text style={styles.modalTitle}>Nova evolução</Text>

              <Field
                label="Evolução"
                value={evContent}
                onChangeText={setEvContent}
                multiline
              />

              <Field
                label="Pressão arterial"
                value={String(evVital.pa ?? "")}
                onChangeText={(value) =>
                  setEvVital((current) => ({
                    ...current,
                    pa: value,
                  }))
                }
              />

              <Field
                label="Frequência cardíaca"
                value={String(evVital.fc ?? "")}
                onChangeText={(value) =>
                  setEvVital((current) => ({
                    ...current,
                    fc: value,
                  }))
                }
                keyboardType="numeric"
              />

              <Field
                label="Frequência respiratória"
                value={String(evVital.fr ?? "")}
                onChangeText={(value) =>
                  setEvVital((current) => ({
                    ...current,
                    fr: value,
                  }))
                }
                keyboardType="numeric"
              />

              <Field
                label="Temperatura"
                value={String(evVital.temp ?? "")}
                onChangeText={(value) =>
                  setEvVital((current) => ({
                    ...current,
                    temp: value,
                  }))
                }
                keyboardType="numeric"
              />

              <Field
                label="Saturação O₂"
                value={String(evVital.spo2 ?? "")}
                onChangeText={(value) =>
                  setEvVital((current) => ({
                    ...current,
                    spo2: value,
                  }))
                }
                keyboardType="numeric"
              />

              <Field
                label="Dor"
                value={String(evVital.dor ?? "")}
                onChangeText={(value) =>
                  setEvVital((current) => ({
                    ...current,
                    dor: value,
                  }))
                }
                keyboardType="numeric"
              />

              <Field
                label="Glicemia"
                value={String(evVital.glicemia ?? "")}
                onChangeText={(value) =>
                  setEvVital((current) => ({
                    ...current,
                    glicemia: value,
                  }))
                }
                keyboardType="numeric"
              />

              <View style={styles.modalActions}>
                <Button
                  title="Cancelar"
                  onPress={() => setEvOpen(false)}
                />

                <Button
                  title={savingEv ? "Salvando..." : "Registrar"}
                  onPress={saveEvolution}
                  disabled={savingEv || !canEdit}
                />
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal
        visible={versionOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setVersionOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <ScrollView>
              <Text style={styles.modalTitle}>Nova versão</Text>

              <Field
                label="Observação da versão"
                value={versionNote}
                onChangeText={setVersionNote}
                multiline
              />

              <View style={styles.modalActions}>
                <Button
                  title="Cancelar"
                  onPress={() => setVersionOpen(false)}
                />

                <Button
                  title="Salvar rascunho"
                  onPress={async () => {
                    if (!canEdit) {
                      Alert.alert(
                        "SAE",
                        "Você não tem permissão para criar uma versão.",
                      );
                      return;
                    }

                    await publishSection(
                      "avaliacao",
                      {
                        historico,
                        vital_signs: vital,
                        diagnosticos,
                        planejamento,
                        prescricoes,
                        avaliacao,
                        status,
                      },
                      "rascunho",
                    );

                    setVersionOpen(false);
                  }}
                  disabled={!canEdit}
                />

                <Button
                  title="Publicar"
                  onPress={async () => {
                    if (!canEdit) {
                      Alert.alert(
                        "SAE",
                        "Você não tem permissão para publicar uma versão.",
                      );
                      return;
                    }

                    await publishSection(
                      "avaliacao",
                      {
                        historico,
                        vital_signs: vital,
                        diagnosticos,
                        planejamento,
                        prescricoes,
                        avaliacao,
                        status,
                      },
                      "publicada",
                    );

                    setVersionOpen(false);
                  }}
                  disabled={!canEdit}
                />
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
  },

  content: {
    padding: 16,
    paddingBottom: 48,
  },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: BG,
    padding: 24,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 16,
  },

  title: {
    fontSize: 24,
    fontWeight: "800",
    color: TEXT,
  },

  subtitle: {
    marginTop: 4,
    fontSize: 13,
    color: SECONDARY,
  },

  summaryCard: {
    backgroundColor: CARD,
    borderRadius: 16,
    padding: 18,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: BORDER,
  },

  summaryNumber: {
    fontSize: 30,
    fontWeight: "800",
    color: BLUE,
  },

  summaryLabel: {
    color: SECONDARY,
    marginTop: 2,
  },

  listTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: TEXT,
    marginBottom: 10,
  },

  recordCard: {
    backgroundColor: CARD,
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: BORDER,
  },

  recordSelected: {
    borderColor: BLUE,
    borderWidth: 2,
  },

  recordHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    marginBottom: 6,
  },

  recordTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: "800",
    color: TEXT,
  },

  statusBadge: {
    backgroundColor: "#EAF3FF",
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },

  statusText: {
    color: BLUE,
    fontSize: 11,
    fontWeight: "700",
  },

  secondary: {
    color: SECONDARY,
    fontSize: 13,
    lineHeight: 19,
  },

  loadingBox: {
    alignItems: "center",
    padding: 30,
    gap: 10,
  },

  emptyCard: {
    backgroundColor: CARD,
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: BORDER,
    alignItems: "center",
    marginBottom: 18,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: TEXT,
    marginBottom: 8,
  },

  emptyText: {
    textAlign: "center",
    color: SECONDARY,
    lineHeight: 20,
    marginBottom: 16,
  },

  button: {
    minHeight: 44,
    borderRadius: 12,
    paddingHorizontal: 14,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 5,
  },

  buttonPrimary: {
    backgroundColor: BLUE,
  },

  buttonDanger: {
    backgroundColor: RED,
  },

  buttonText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 13,
  },

  disabled: {
    opacity: 0.55,
  },

  editor: {
    backgroundColor: CARD,
    borderRadius: 18,
    marginTop: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: BORDER,
  },

  editorHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 14,
  },

  editorTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: TEXT,
  },

  tabs: {
    gap: 8,
    paddingBottom: 12,
  },

  tab: {
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: BG,
  },

  tabActive: {
    backgroundColor: BLUE,
  },

  tabText: {
    color: SECONDARY,
    fontWeight: "700",
    fontSize: 12,
  },

  tabTextActive: {
    color: "#FFFFFF",
  },

  section: {
    marginTop: 10,
    marginBottom: 18,
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: TEXT,
    marginBottom: 12,
  },

  field: {
    marginBottom: 12,
  },

  label: {
    color: TEXT,
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 6,
  },

  input: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 12,
    minHeight: 44,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: TEXT,
    fontSize: 14,
  },

  multiline: {
    minHeight: 96,
    textAlignVertical: "top",
  },

  itemCard: {
    backgroundColor: BG,
    borderRadius: 12,
    padding: 13,
    marginTop: 10,
    borderWidth: 1,
    borderColor: BORDER,
  },

  itemTitle: {
    color: TEXT,
    fontSize: 14,
    fontWeight: "800",
    marginBottom: 5,
  },

  deleteText: {
    color: RED,
    fontWeight: "800",
    marginTop: 10,
  },

  statusRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },

  statusChoice: {
    backgroundColor: BG,
    borderWidth: 1,
    borderColor: BORDER,
    paddingHorizontal: 10,
    paddingVertical: 9,
    borderRadius: 10,
  },

  statusChoiceActive: {
    backgroundColor: GREEN,
    borderColor: GREEN,
  },

  statusChoiceText: {
    color: SECONDARY,
    fontSize: 11,
    fontWeight: "700",
  },

  statusChoiceTextActive: {
    color: "#FFFFFF",
  },

  saveArea: {
    borderTopWidth: 1,
    borderTopColor: BORDER,
    paddingTop: 14,
    marginTop: 8,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },

  modalCard: {
    maxHeight: "90%",
    backgroundColor: CARD,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    padding: 18,
  },

  modalTitle: {
    fontSize: 21,
    fontWeight: "800",
    color: TEXT,
    marginBottom: 16,
  },

  modalActions: {
    marginTop: 10,
    gap: 4,
  },

  patientOption: {
    padding: 13,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: BORDER,
    marginBottom: 7,
  },

  patientSelected: {
    borderColor: BLUE,
    backgroundColor: "#EAF3FF",
  },

  patientName: {
    color: TEXT,
    fontWeight: "700",
  },

  searchLoader: {
    marginBottom: 10,
  },
});
