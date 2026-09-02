import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/auth-context";
import { colors } from "@/theme/colors";
import {
  AppButton,
  Badge,
  Card,
  ErrorState,
  LoadingState,
  toneForStatus,
} from "@/components/ui/Kit";

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

type Procedure = {
  code: string;
  name?: string | null;
};

type ServiceCallStatus =
  | "buscando"
  | "aceita"
  | "a_caminho"
  | "em_atendimento"
  | "concluida"
  | "cancelada";

const STATUS_LABEL: Record<string, string> = {
  buscando: "Buscando profissional",
  aceita: "Aceita",
  a_caminho: "A caminho",
  em_atendimento: "Em atendimento",
  concluida: "Concluída",
  cancelada: "Cancelada",
};

const TIMELINE = [
  ["buscando", "created_at"],
  ["aceita", "accepted_at"],
  ["em_atendimento", "started_at"],
  ["concluida", "completed_at"],
] as const;

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
  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function nextStatus(status: ServiceCallStatus): {
  next: Exclude<ServiceCallStatus, "buscando" | "cancelada">;
  label: string;
} | null {
  switch (status) {
    case "aceita":
      return {
        next: "a_caminho",
        label: "Estou a caminho",
      };
    case "a_caminho":
      return {
        next: "em_atendimento",
        label: "Iniciar atendimento",
      };
    case "em_atendimento":
      return {
        next: "concluida",
        label: "Concluir atendimento",
      };
    default:
      return null;
  }
}

export default function ChamadaDetalheScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const router = useRouter();
  const { user } = useAuth();

  const [call, setCall] = useState<ServiceCall | null>(null);
  const [procedure, setProcedure] = useState<Procedure | null>(null);
  const [professionalName, setProfessionalName] =
    useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!id) {
      setCall(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const { data, error: callError } = await supabase
      .from("service_calls")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (callError) {
      setError(callError.message);
      setLoading(false);
      return;
    }

    const row = (data ?? null) as ServiceCall | null;
    setCall(row);

    if (!row) {
      setLoading(false);
      return;
    }

    const [procedureRes, profileRes] = await Promise.all([
      supabase
        .from("procedures")
        .select("*")
        .eq("code", row.procedure_code)
        .maybeSingle(),

      row.professional_id
        ? supabase
            .from("profiles")
            .select("full_name")
            .eq("id", row.professional_id)
            .maybeSingle()
        : Promise.resolve({ data: null }),
    ]);

    setProcedure((procedureRes.data ?? null) as Procedure | null);

    const professional = profileRes.data as
      | { full_name?: string | null }
      | null;

    setProfessionalName(professional?.full_name ?? null);
    setLoading(false);
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!id) return;

    const channel = supabase
      .channel(`service-call-${id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "service_calls",
          filter: `id=eq.${id}`,
        },
        () => void load(),
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [id, load]);

  async function advance() {
    if (!call || !user?.id) return;

    // Somente o profissional atualmente vinculado pode avançar
    // a chamada. O RLS/trigger do Supabase continua sendo a
    // autoridade definitiva de segurança.
    if (call.professional_id !== user.id) {
      Alert.alert(
        "Acesso não permitido",
        "Somente o profissional responsável pode avançar esta chamada.",
      );
      return;
    }

    const currentStatus = call.status as ServiceCallStatus;
    const step = nextStatus(currentStatus);

    if (!step) return;

    setBusy(true);

    const patch: {
      status:
        | "aceita"
        | "a_caminho"
        | "em_atendimento"
        | "concluida";
      started_at?: string;
      completed_at?: string;
    } = {
      status: step.next,
    };

    if (step.next === "em_atendimento") {
      patch.started_at = new Date().toISOString();
    }

    if (step.next === "concluida") {
      patch.completed_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from("service_calls")
      .update(patch)
      .eq("id", call.id)
      .eq("professional_id", user.id)
      .eq("status", currentStatus)
      .select("id")
      .maybeSingle();

    setBusy(false);

    if (error) {
      Alert.alert(
        "Erro",
        "Não foi possível atualizar a chamada.",
      );
      return;
    }

    if (!data) {
      Alert.alert(
        "Chamada atualizada",
        "O status desta chamada mudou. Os dados serão atualizados.",
      );
      await load();
      return;
    }

    await load();
  }

  async function cancel() {
    if (!call || !user?.id) return;

    const isRequester =
      user.id === call.requester_id ||
      user.id === call.patient_id;

    const isProfessional =
      user.id === call.professional_id;

    if (!isRequester && !isProfessional) {
      Alert.alert(
        "Acesso não permitido",
        "Você não participa desta chamada.",
      );
      return;
    }

    if (
      call.status === "concluida" ||
      call.status === "cancelada"
    ) {
      Alert.alert(
        "Chamada encerrada",
        "Esta chamada não pode mais ser cancelada.",
      );
      return;
    }

    Alert.alert(
      "Cancelar chamada",
      "Tem certeza que deseja cancelar este atendimento?",
      [
        {
          text: "Voltar",
          style: "cancel",
        },
        {
          text: "Cancelar chamada",
          style: "destructive",
          onPress: async () => {
            setBusy(true);

            const { data, error } = await supabase
              .from("service_calls")
              .update({
                status: "cancelada",
                cancelled_at: new Date().toISOString(),
              })
              .eq("id", call.id)
              .eq("status", call.status as ServiceCallStatus)
              .or(
                `requester_id.eq.${user.id},patient_id.eq.${user.id},professional_id.eq.${user.id}`,
              )
              .select("id")
              .maybeSingle();

            setBusy(false);

            if (error) {
              Alert.alert(
                "Erro",
                "Não foi possível cancelar a chamada.",
              );
              return;
            }

            if (!data) {
              Alert.alert(
                "Chamada atualizada",
                "A chamada já foi alterada ou encerrada.",
              );
              await load();
              return;
            }

            await load();
          },
        },
      ],
    );
  }

  if (loading) {
    return (
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
      >
        <LoadingState />
      </ScrollView>
    );
  }

  if (error) {
    return (
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
      >
        <ErrorState message={error} />

        <AppButton
          label="Voltar"
          variant="outline"
          onPress={() => router.back()}
        />
      </ScrollView>
    );
  }

  if (!call) {
    return (
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
      >
        <Text style={styles.notFound}>
          Chamada não encontrada ou sem permissão de acesso.
        </Text>

        <AppButton
          label="Voltar para chamadas"
          variant="outline"
          onPress={() => router.back()}
        />
      </ScrollView>
    );
  }

  const isProfessional =
    user?.id === call.professional_id;

  const isRequester =
    user?.id === call.requester_id ||
    user?.id === call.patient_id;

  const step = nextStatus(call.status as ServiceCallStatus);

  const canCancel =
    (isRequester || isProfessional) &&
    call.status !== "concluida" &&
    call.status !== "cancelada";

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={async () => {
            setRefreshing(true);
            await load();
            setRefreshing(false);
          }}
        />
      }
    >
      <View style={styles.topBar}>
        <AppButton
          label="← Voltar"
          variant="outline"
          onPress={() => router.back()}
        />
      </View>

      <Text style={styles.title}>
        {procedure?.name ?? call.procedure_code}
      </Text>

      <Text style={styles.code}>
        {call.procedure_code}
      </Text>

      <Card style={styles.statusCard}>
        <Text style={styles.statusCaption}>
          SITUAÇÃO
        </Text>

        <Text style={styles.statusTitle}>
          {STATUS_LABEL[call.status] ?? call.status}
        </Text>

        <Text style={styles.price}>
          {money(call.price_cents)}
        </Text>
      </Card>

      <Card style={styles.card}>
        <Text style={styles.cardTitle}>
          Atendimento
        </Text>

        <Text style={styles.label}>
          Endereço
        </Text>

        <Text style={styles.value}>
          {call.address}
        </Text>

        {call.address_complement ? (
          <Text style={styles.muted}>
            {call.address_complement}
          </Text>
        ) : null}

        <Text style={styles.label}>
          Profissional
        </Text>

        <Text style={styles.value}>
          {professionalName ??
            "Aguardando profissional habilitado"}
        </Text>

        {call.notes ? (
          <>
            <Text style={styles.label}>
              Observações
            </Text>

            <Text style={styles.notes}>
              {call.notes}
            </Text>
          </>
        ) : null}
      </Card>

      <Text style={styles.sectionTitle}>
        LINHA DO TEMPO
      </Text>

      {TIMELINE.map(([status, field]) => {
        const value = call[field] as string | null | undefined;

        return (
          <Card key={status} style={styles.timelineItem}>
            <View
              style={[
                styles.dot,
                value
                  ? styles.dotDone
                  : styles.dotPending,
              ]}
            />

            <View style={{ flex: 1 }}>
              <Text style={styles.timelineTitle}>
                {STATUS_LABEL[status]}
              </Text>

              <Text style={styles.timelineDate}>
                {dateTime(value)}
              </Text>
            </View>

            {status === call.status ? (
              <Badge
                label="Atual"
                tone={toneForStatus(call.status)}
              />
            ) : null}
          </Card>
        );
      })}

      {call.status === "cancelada" ? (
        <Badge
          label={`Cancelada em ${dateTime(call.cancelled_at)}`}
          tone="danger"
        />
      ) : null}

      <View style={styles.actions}>
        {isProfessional && step ? (
          <AppButton
            label={
              busy
                ? "Atualizando..."
                : step.label
            }
            onPress={() => void advance()}
            disabled={busy}
          />
        ) : null}

        {canCancel ? (
          <AppButton
            label="Cancelar chamada"
            variant="outline"
            onPress={() => void cancel()}
            disabled={busy}
          />
        ) : null}
      </View>

      {busy ? (
        <ActivityIndicator
          style={{ marginTop: 10 }}
          color={colors.primary}
        />
      ) : null}
    </ScrollView>
  );
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
  topBar: {
    marginBottom: 12,
  },
  title: {
    fontSize: 23,
    fontWeight: "800",
    color: colors.text,
  },
  code: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  statusCard: {
    marginTop: 16,
    padding: 20,
    borderRadius: 22,
    backgroundColor: colors.primary,
  },
  statusCaption: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1,
    color: "#FFFFFF",
    opacity: 0.85,
  },
  statusTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#FFFFFF",
    marginTop: 5,
  },
  price: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
    marginTop: 7,
  },
  card: {
    marginTop: 14,
    padding: 16,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.text,
    marginBottom: 12,
  },
  label: {
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
    color: colors.textMuted,
    marginTop: 10,
  },
  value: {
    fontSize: 14,
    color: colors.text,
    marginTop: 3,
  },
  muted: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  notes: {
    backgroundColor: colors.background ?? "#F5F7FA",
    padding: 12,
    borderRadius: 12,
    fontSize: 12,
    lineHeight: 18,
    color: colors.textMuted,
    marginTop: 5,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.8,
    color: colors.textMuted,
    marginTop: 24,
    marginBottom: 8,
  },
  timelineItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 13,
    marginTop: 7,
  },
  dot: {
    width: 11,
    height: 11,
    borderRadius: 6,
    marginRight: 11,
  },
  dotDone: {
    backgroundColor: colors.success ?? "#27AE60",
  },
  dotPending: {
    backgroundColor: colors.textMuted,
    opacity: 0.3,
  },
  timelineTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.text,
  },
  timelineDate: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 2,
  },
  actions: {
    gap: 10,
    marginTop: 22,
  },
  notFound: {
    textAlign: "center",
    color: colors.textMuted,
    paddingVertical: 30,
    marginBottom: 10,
  },
});
