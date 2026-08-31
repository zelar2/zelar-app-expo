import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useRouter } from "expo-router";

import { fromTable } from "@/integrations/supabase/typed";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/auth-context";
import { colors } from "@/theme/colors";
import {
  AppButton,
  Badge,
  Card,
  EmptyState,
  InitialsAvatar,
  LoadingState,
  toneForStatus,
} from "@/components/ui/Kit";

type Procedure = {
  id?: string;
  code: string;
  name?: string | null;
  price_cents?: number | null;
  is_active?: boolean | null;
};

type ServiceCall = {
  id: string;
  requester_id: string;
  patient_id?: string | null;
  professional_id?: string | null;
  procedure_code: string;
  address: string;
  address_complement?: string | null;
  price_cents?: number | null;
  status: string;
  notes?: string | null;
  created_at?: string | null;
  accepted_at?: string | null;
  started_at?: string | null;
  completed_at?: string | null;
  cancelled_at?: string | null;
};

const ACTIVE_STATUSES = [
  "buscando",
  "aceita",
  "a_caminho",
  "em_atendimento",
];

const STATUS_LABEL: Record<string, string> = {
  buscando: "Buscando profissional",
  aceita: "Aceita",
  a_caminho: "A caminho",
  em_atendimento: "Em atendimento",
  concluida: "Concluída",
  cancelada: "Cancelada",
};

const CATEGORY_LABEL: Record<string, string> = {
  enfermagem: "Enfermagem",
  tecnico_enfermagem: "Técnico de enfermagem",
  fisioterapia: "Fisioterapia",
  cuidador: "Cuidador",
  medico: "Médico",
  nutricionista: "Nutricionista",
  psicologo: "Psicólogo",
};

function money(cents?: number | null) {
  if (cents === null || cents === undefined) return "—";
  return (cents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function dateTime(value?: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("pt-BR");
}

function procedureName(
  procedure: Procedure | undefined,
  code: string,
) {
  return procedure?.name || code;
}

export default function ChamadasScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const [procedures, setProcedures] = useState<Procedure[]>([]);
  const [myCalls, setMyCalls] = useState<ServiceCall[]>([]);
  const [openCalls, setOpenCalls] = useState<ServiceCall[]>([]);
  const [profile, setProfile] = useState<Record<string, unknown> | null>(null);
  const [address, setAddress] = useState("");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [accepting, setAccepting] = useState<string | null>(null);
  const [requestOpen, setRequestOpen] = useState(false);
  const [savingRequest, setSavingRequest] = useState(false);

  const [procedureCode, setProcedureCode] = useState("");
  const [patientId, setPatientId] = useState("");
  const [requestAddress, setRequestAddress] = useState("");
  const [addressComplement, setAddressComplement] = useState("");
  const [notes, setNotes] = useState("");

  const loadAll = useCallback(async () => {
    if (!user?.id) return;

    setLoading(true);

    const [procRes, mineRes, openRes, profileRes, sensitiveRes] =
      await Promise.all([
        fromTable("procedures")
          .select("*")
          .eq("is_active", true)
          .order("code"),

        supabase
          .from("service_calls")
          .select("*")
          .or(
            `requester_id.eq.${user.id},patient_id.eq.${user.id},professional_id.eq.${user.id}`,
          )
          .order("created_at", { ascending: false }),

        supabase
          .from("service_calls")
          .select("*")
          .eq("status", "buscando")
          .is("professional_id", null)
          .order("created_at", { ascending: false }),

        fromTable("profiles")
          .select("*")
          .eq("id", user.id)
          .maybeSingle(),

        fromTable("profiles_sensitive")
          .select("address")
          .eq("id", user.id)
          .maybeSingle(),
      ]);

    setProcedures((procRes.data ?? []) as Procedure[]);
    setMyCalls((mineRes.data ?? []) as ServiceCall[]);

    setOpenCalls(
      ((openRes.data ?? []) as ServiceCall[]).filter(
        (call) => call.requester_id !== user.id,
      ),
    );

    setProfile((profileRes.data ?? null) as Record<string, unknown> | null);

    const sensitive = sensitiveRes.data as
      | { address?: string | null }
      | null;

    const savedAddress = sensitive?.address ?? "";
    setAddress(savedAddress);

    if (!requestAddress && savedAddress) {
      setRequestAddress(savedAddress);
    }

    setLoading(false);
  }, [user?.id]);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel("service-calls-expo-feed")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "service_calls",
        },
        () => {
          void loadAll();
        },
      )
      .subscribe();

    if (!channel) return;

    return () => {
      // Mantido como cleanup defensivo para versões diferentes
      // do cliente Supabase usado pelo projeto.
    };
  }, [user?.id]);

  const procByCode = useMemo(
    () =>
      Object.fromEntries(
        procedures.map((procedure) => [procedure.code, procedure]),
      ),
    [procedures],
  );

  const isProfessional =
    String(profile?.role ?? profile?.primary_role ?? profile?.category ?? "")
      .toLowerCase() === "profissional" ||
    Boolean(profile?.is_professional);

  const proCategory =
    String(profile?.category ?? profile?.professional_category ?? "") ||
    null;

  const activeCalls = myCalls.filter((call) =>
    ACTIVE_STATUSES.includes(call.status),
  );

  const pastCalls = myCalls.filter(
    (call) => !ACTIVE_STATUSES.includes(call.status),
  );

  async function acceptCall(call: ServiceCall) {
    if (!user?.id) return;

    setAccepting(call.id);

    const { data, error } = await supabase
      .from("service_calls")
      .update({
        professional_id: user.id,
        status: "aceita",
        accepted_at: new Date().toISOString(),
      })
      .eq("id", call.id)
      .eq("status", "buscando")
      .is("professional_id", null)
      .select("id")
      .maybeSingle();

    setAccepting(null);

    if (error) {
      Alert.alert(
        "Não foi possível aceitar",
        error.message.includes("nao habilitada")
          ? "Sua categoria profissional não pode executar este procedimento."
          : error.message,
      );
      return;
    }

    if (!data) {
      Alert.alert(
        "Chamada indisponível",
        "Esta chamada já foi aceita por outro profissional.",
      );
      await loadAll();
      return;
    }

    await supabase.from("call_offers").upsert(
      {
        call_id: call.id,
        professional_id: user.id,
        status: "aceita",
        responded_at: new Date().toISOString(),
      },
      { onConflict: "call_id,professional_id" },
    );

    Alert.alert("Chamada aceita", "Siga para o atendimento.");
    await loadAll();
  }

  async function createRequest() {
    if (!user?.id) return;

    if (!procedureCode) {
      Alert.alert("Atenção", "Selecione um procedimento.");
      return;
    }

    if (!requestAddress.trim()) {
      Alert.alert("Atenção", "Informe o endereço do atendimento.");
      return;
    }

    setSavingRequest(true);

    try {
      const procedure = procByCode[procedureCode];

      const payload = {
        requester_id: user.id,
        patient_id: patientId.trim() || user.id,
        procedure_code: procedureCode,
        address: requestAddress.trim(),
        address_complement: addressComplement.trim() || null,
        price_cents: procedure?.price_cents ?? 0,
        status: "buscando" as const,
        notes: notes.trim() || null,
      };

      const { error } = await supabase.from("service_calls").insert(payload);

      if (error) throw error;

      setRequestOpen(false);
      setProcedureCode("");
      setPatientId("");
      setAddressComplement("");
      setNotes("");

      Alert.alert(
        "Atendimento solicitado",
        "Sua chamada está procurando um profissional habilitado.",
      );

      await loadAll();
    } catch (error) {
      Alert.alert(
        "Erro ao solicitar atendimento",
        error instanceof Error ? error.message : String(error),
      );
    } finally {
      setSavingRequest(false);
    }
  }

  function openRequest() {
    setRequestAddress(address);
    setRequestOpen(true);
  }

  function renderCall(call: ServiceCall, available = false) {
    const procedure = procByCode[call.procedure_code];

    return (
      <Card
        key={call.id}
        style={styles.callCard}
        onPress={() =>
          router.push({
            pathname: "/chamada-detalhe",
            params: { id: call.id },
          })
        }
      >
        <View style={styles.callHeader}>
          <InitialsAvatar
            name={procedureName(procedure, call.procedure_code)}
            size={44}
          />

          <View style={styles.callInfo}>
            <Text style={styles.callTitle}>
              {procedureName(procedure, call.procedure_code)}
            </Text>

            <Text style={styles.callCode}>
              {call.procedure_code}
            </Text>
          </View>

          <Badge
            label={STATUS_LABEL[call.status] ?? call.status}
            tone={toneForStatus(call.status)}
          />
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoLabel}>Endereço</Text>
          <Text style={styles.infoValue}>{call.address}</Text>

          {call.address_complement ? (
            <Text style={styles.infoMuted}>
              {call.address_complement}
            </Text>
          ) : null}
        </View>

        <View style={styles.bottomRow}>
          <Text style={styles.price}>{money(call.price_cents)}</Text>

          {available ? (
            <View style={{ flex: 1, marginLeft: 10 }}>
              <AppButton
                label={
                  accepting === call.id ? "Aceitando..." : "Aceitar chamada"
                }
                onPress={() => void acceptCall(call)}
                disabled={accepting === call.id}
              />
            </View>
          ) : (
            <Text style={styles.date}>
              {dateTime(call.created_at)}
            </Text>
          )}
        </View>
      </Card>
    );
  }

  if (loading) {
    return (
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
      >
        <Text style={styles.title}>Chamadas</Text>
        <LoadingState />
      </ScrollView>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={async () => {
            setRefreshing(true);
            await loadAll();
            setRefreshing(false);
          }}
        />
      }
    >
      <View style={styles.heading}>
        <View>
          <Text style={styles.title}>Chamadas</Text>
          <Text style={styles.subtitle}>
            {isProfessional
              ? "Atendimentos sob demanda"
              : "Solicite um atendimento"}
          </Text>
        </View>
      </View>

      {!isProfessional ? (
        <AppButton
          label="Solicitar atendimento"
          onPress={openRequest}
        />
      ) : (
        <Card style={styles.categoryCard}>
          <Text style={styles.categoryTitle}>
            {proCategory
              ? CATEGORY_LABEL[proCategory] ?? proCategory
              : "Categoria não definida"}
          </Text>

          <Text style={styles.categoryText}>
            Você só recebe chamadas de procedimentos que sua categoria
            pode executar legalmente.
          </Text>
        </Card>
      )}

      {isProfessional ? (
        <>
          <SectionTitle title="Disponíveis" />

          {openCalls.length === 0 ? (
            <EmptyState message="Nenhuma chamada disponível para a sua categoria no momento." />
          ) : (
            openCalls.map((call) => renderCall(call, true))
          )}
        </>
      ) : null}

      <SectionTitle title="Em andamento" />

      {activeCalls.length === 0 ? (
        <EmptyState message="Nenhum atendimento em andamento." />
      ) : (
        activeCalls.map((call) => renderCall(call))
      )}

      <SectionTitle title="Histórico" />

      {pastCalls.length === 0 ? (
        <EmptyState message="Nenhum atendimento no histórico." />
      ) : (
        pastCalls.map((call) => renderCall(call))
      )}

      <Modal
        visible={requestOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setRequestOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>
              Solicitar atendimento
            </Text>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.label}>Procedimento *</Text>

              <View style={styles.options}>
                {procedures.map((procedure) => (
                  <Text
                    key={procedure.code}
                    onPress={() => setProcedureCode(procedure.code)}
                    style={[
                      styles.option,
                      procedureCode === procedure.code &&
                        styles.optionSelected,
                    ]}
                  >
                    {procedure.name ?? procedure.code}
                  </Text>
                ))}
              </View>

              <Text style={styles.label}>Paciente</Text>

              <TextInput
                value={patientId}
                onChangeText={setPatientId}
                placeholder="ID do paciente (opcional)"
                style={styles.input}
              />

              <Text style={styles.label}>Endereço *</Text>

              <TextInput
                value={requestAddress}
                onChangeText={setRequestAddress}
                placeholder="Endereço completo"
                multiline
                style={[styles.input, styles.textarea]}
              />

              <Text style={styles.label}>Complemento</Text>

              <TextInput
                value={addressComplement}
                onChangeText={setAddressComplement}
                placeholder="Apartamento, bloco, referência..."
                style={styles.input}
              />

              <Text style={styles.label}>Observações</Text>

              <TextInput
                value={notes}
                onChangeText={setNotes}
                placeholder="Informações importantes para o profissional"
                multiline
                style={[styles.input, styles.textarea]}
              />
            </ScrollView>

            <View style={styles.modalActions}>
              <View style={{ flex: 1 }}>
                <AppButton
                  label="Cancelar"
                  variant="outline"
                  onPress={() => setRequestOpen(false)}
                  disabled={savingRequest}
                />
              </View>

              <View style={{ flex: 1 }}>
                <AppButton
                  label={
                    savingRequest
                      ? "Solicitando..."
                      : "Solicitar atendimento"
                  }
                  onPress={() => void createRequest()}
                  disabled={savingRequest}
                />
              </View>
            </View>

            {savingRequest ? (
              <ActivityIndicator
                style={{ marginTop: 12 }}
                color={colors.primary}
              />
            ) : null}
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

function SectionTitle({ title }: { title: string }) {
  return <Text style={styles.sectionTitle}>{title}</Text>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background ?? colors.card,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  heading: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: 3,
  },
  categoryCard: {
    marginTop: 14,
    padding: 14,
  },
  categoryTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.text,
  },
  categoryText: {
    fontSize: 12,
    color: colors.textMuted,
    lineHeight: 18,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.7,
    marginTop: 24,
    marginBottom: 8,
  },
  callCard: {
    marginTop: 8,
    padding: 14,
  },
  callHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  callInfo: {
    flex: 1,
  },
  callTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.text,
  },
  callCode: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  infoBox: {
    marginTop: 12,
    padding: 10,
    borderRadius: 12,
    backgroundColor: colors.background ?? "#F5F7FA",
  },
  infoLabel: {
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
    color: colors.textMuted,
  },
  infoValue: {
    fontSize: 13,
    color: colors.text,
    marginTop: 3,
  },
  infoMuted: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
  },
  price: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.text,
  },
  date: {
    marginLeft: "auto",
    fontSize: 10,
    color: colors.textMuted,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(51,51,51,0.42)",
    justifyContent: "flex-end",
  },
  sheet: {
    maxHeight: "90%",
    backgroundColor: colors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 18,
    paddingBottom: 28,
  },
  sheetTitle: {
    fontSize: 19,
    fontWeight: "800",
    color: colors.text,
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.text,
    marginTop: 10,
    marginBottom: 6,
  },
  input: {
    minHeight: 46,
    borderWidth: 1,
    borderColor: colors.border ?? "#E2E8F0",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: colors.text,
    backgroundColor: colors.card,
  },
  textarea: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  options: {
    gap: 7,
  },
  option: {
    padding: 11,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: colors.border ?? "#E2E8F0",
    color: colors.text,
    fontSize: 13,
  },
  optionSelected: {
    borderColor: colors.primary,
    backgroundColor: "#EAF3FF",
    fontWeight: "700",
  },
  modalActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
  },
});
