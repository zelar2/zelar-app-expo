import { useMemo, useState } from "react";
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import { colors } from "@/theme/colors";
import {
  Badge,
  Card,
  ChipSelect,
  EmptyState,
  ErrorState,
  InitialsAvatar,
  LoadingState,
  SearchInput,
  toneForStatus,
} from "@/components/ui/Kit";

type AppointmentRow = {
  id: string;
  title: string | null;
  type: string | null;
  status: string | null;
  scheduled_at: string;
  patient_id: string | null;
  professional_id: string | null;
};

type ProfileRow = {
  id: string;
  full_name: string | null;
};

type Atendimento = {
  id: string;
  paciente: string;
  profissional: string;
  tipo: string;
  data: string;
  dataIso: string;
  status: string;
  avaliacao: number | null;
};

const STATUS_OPTIONS = [
  "Todos",
  "Agendado",
  "Em Andamento",
  "Concluído",
  "Cancelado",
];

const statusLabel: Record<string, string> = {
  agendado: "Agendado",
  confirmado: "Agendado",
  em_andamento: "Em Andamento",
  em_atendimento: "Em Andamento",
  concluido: "Concluído",
  cancelado: "Cancelado",
};

const tipoLabel: Record<string, string> = {
  domiciliar: "Domiciliar",
  teleconsulta: "Teleconsulta",
  presencial: "Presencial",
};

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDateOnly(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleDateString("pt-BR");
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export default function Screen() {
  const [busca, setBusca] = useState("");
  const [statusFiltro, setStatusFiltro] = useState("Todos");

  const {
    data: atendimentos = [],
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ["atendimentos"],
    queryFn: async (): Promise<Atendimento[]> => {
      const { data, error } = await supabase
        .from("appointments")
        .select(
          "id, title, type, status, scheduled_at, patient_id, professional_id",
        )
        .order("scheduled_at", { ascending: false })
        .limit(200);

      if (error) {
        throw error;
      }

      const appointments = (data ?? []) as AppointmentRow[];

      const ids = [
        ...new Set(
          appointments
            .flatMap((appointment) => [
              appointment.patient_id,
              appointment.professional_id,
            ])
            .filter(Boolean) as string[],
        ),
      ];

      let perfis: ProfileRow[] = [];

      if (ids.length) {
        const { data: profiles, error: profilesError } = await supabase
          .from("profiles")
          .select("id, full_name")
          .in("id", ids);

        if (profilesError) {
          throw profilesError;
        }

        perfis = (profiles ?? []) as ProfileRow[];
      }

      const nomes = new Map(
        perfis.map((profile) => [
          profile.id,
          profile.full_name ?? "—",
        ]),
      );

      return appointments.map((appointment) => ({
        id: appointment.id.slice(0, 8).toUpperCase(),
        paciente: nomes.get(appointment.patient_id ?? "") ?? "—",
        profissional: appointment.professional_id
          ? nomes.get(appointment.professional_id) ?? "—"
          : "Sem profissional",
        tipo: tipoLabel[appointment.type ?? ""] ?? appointment.type ?? "—",
        data: formatDate(appointment.scheduled_at),
        dataIso: appointment.scheduled_at,
        status:
          statusLabel[appointment.status ?? ""] ??
          appointment.status ??
          "—",
        avaliacao: null,
      }));
    },
  });

  const hojeStr = new Date().toLocaleDateString("pt-BR");

  const filtrados = useMemo(() => {
    const query = busca.trim().toLowerCase();

    return atendimentos.filter((atendimento) => {
      const matchBusca =
        !query ||
        atendimento.paciente.toLowerCase().includes(query) ||
        atendimento.profissional.toLowerCase().includes(query);

      const matchStatus =
        statusFiltro === "Todos" ||
        atendimento.status === statusFiltro;

      return matchBusca && matchStatus;
    });
  }, [atendimentos, busca, statusFiltro]);

  const hoje = atendimentos.filter(
    (atendimento) =>
      formatDateOnly(atendimento.dataIso) === hojeStr,
  ).length;

  const concluidos = atendimentos.filter(
    (atendimento) => atendimento.status === "Concluído",
  ).length;

  const emAndamento = atendimentos.filter(
    (atendimento) => atendimento.status === "Em Andamento",
  ).length;

  const cancelados = atendimentos.filter(
    (atendimento) => atendimento.status === "Cancelado",
  ).length;

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Atendimentos</Text>
          <Text style={styles.subtitle}>
            Gestão de atendimentos e consultas
          </Text>
        </View>
        <LoadingState />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Atendimentos</Text>
          <Text style={styles.subtitle}>
            Gestão de atendimentos e consultas
          </Text>
        </View>
        <ErrorState message={(error as Error).message} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={filtrados}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={() => {
              void refetch();
            }}
            tintColor={colors.primary}
          />
        }
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <View>
            <View style={styles.header}>
              <Text style={styles.title}>Atendimentos</Text>
              <Text style={styles.subtitle}>
                Gestão de atendimentos e consultas
              </Text>
            </View>

            <SearchInput
              value={busca}
              onChangeText={setBusca}
              placeholder="Buscar atendimento..."
            />

            <View style={styles.filterBlock}>
              <Text style={styles.filterLabel}>Status</Text>
              <ChipSelect
                value={statusFiltro}
                options={STATUS_OPTIONS}
                onChange={setStatusFiltro}
              />
            </View>

            <View style={styles.kpiGrid}>
              <Kpi
                label="Hoje"
                value={String(hoje)}
              />
              <Kpi
                label="Concluídos"
                value={String(concluidos)}
              />
              <Kpi
                label="Em Andamento"
                value={String(emAndamento)}
              />
              <Kpi
                label="Cancelados"
                value={String(cancelados)}
              />
            </View>

            <View style={styles.listHeader}>
              <Text style={styles.listTitle}>Atendimentos</Text>
              <Text style={styles.resultCount}>
                {filtrados.length} resultados
              </Text>
            </View>
          </View>
        }
        ListEmptyComponent={
          <EmptyState
            message={
              busca || statusFiltro !== "Todos"
                ? "Nenhum resultado para os filtros informados."
                : "Nenhum atendimento encontrado."
            }
          />
        }
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <View style={styles.row}>
              <InitialsAvatar
                name={getInitials(item.paciente)}
                size={42}
              />

              <View style={styles.main}>
                <Text
                  style={styles.patient}
                  numberOfLines={1}
                >
                  {item.paciente}
                </Text>

                <Text
                  style={styles.professional}
                  numberOfLines={1}
                >
                  {item.profissional}
                </Text>

                <View style={styles.metaRow}>
                  <Text style={styles.type}>{item.tipo}</Text>
                  <Text style={styles.dot}>•</Text>
                  <Text style={styles.date}>{item.data}</Text>
                </View>
              </View>

              <Badge
                label={item.status}
                tone={toneForStatus(item.status)}
              />
            </View>

            <View style={styles.detailRow}>
              <View style={styles.detail}>
                <Text style={styles.detailLabel}>ID</Text>
                <Text style={styles.detailValue}>{item.id}</Text>
              </View>

              <View style={styles.detail}>
                <Text style={styles.detailLabel}>Avaliação</Text>
                <Text style={styles.detailValue}>
                  {item.avaliacao ?? "-"}
                </Text>
              </View>
            </View>
          </Card>
        )}
      />
    </View>
  );
}

function Kpi({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <View style={styles.kpi}>
      <Text style={styles.kpiLabel}>{label}</Text>
      <Text style={styles.kpiValue}>{value}</Text>
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
    paddingBottom: 32,
  },

  header: {
    marginBottom: 16,
  },

  title: {
    fontSize: 24,
    fontWeight: "800",
    color: colors.text,
  },

  subtitle: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 3,
  },

  filterBlock: {
    marginTop: 14,
  },

  filterLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.textMuted,
    marginBottom: 7,
  },

  kpiGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 18,
    marginBottom: 20,
  },

  kpi: {
    width: "47.5%",
    minHeight: 82,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    padding: 14,
    justifyContent: "center",
  },

  kpiLabel: {
    fontSize: 12,
    color: colors.textMuted,
  },

  kpiValue: {
    fontSize: 25,
    fontWeight: "800",
    color: colors.text,
    marginTop: 4,
  },

  listHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },

  listTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.text,
  },

  resultCount: {
    fontSize: 12,
    color: colors.textMuted,
  },

  card: {
    marginTop: 10,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
  },

  main: {
    flex: 1,
    minWidth: 0,
  },

  patient: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.text,
  },

  professional: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },

  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    gap: 5,
  },

  type: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.text,
  },

  dot: {
    fontSize: 10,
    color: colors.textMuted,
  },

  date: {
    flex: 1,
    fontSize: 11,
    color: colors.textMuted,
  },

  detailRow: {
    flexDirection: "row",
    gap: 28,
    marginTop: 13,
    paddingTop: 11,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },

  detail: {
    minWidth: 80,
  },

  detailLabel: {
    fontSize: 10,
    color: colors.textMuted,
    textTransform: "uppercase",
  },

  detailValue: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.text,
    marginTop: 2,
  },
});
