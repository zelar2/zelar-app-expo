import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useRouter } from "expo-router";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/auth-context";
import { colors } from "@/theme/colors";
import {
  Badge,
  Card,
  EmptyState,
  ErrorState,
  InitialsAvatar,
  LoadingState,
  SearchInput,
  TextField,
  AppButton,
} from "@/components/ui/Kit";

type ClienteRow = {
  id: string;
  full_name: string;
  social_name: string | null;
  cpf: string | null;
  phone: string | null;
  status: string | null;
  birth_date: string | null;
  created_at: string | null;
};

const STATUS_LABEL: Record<string, string> = {
  ativo: "Ativo",
  inativo: "Inativo",
  em_avaliacao: "Em avaliação",
  alta: "Alta",
};

function statusTone(status: string | null) {
  switch (status) {
    case "ativo":
      return "success" as const;
    case "inativo":
      return "danger" as const;
    case "em_avaliacao":
      return "warning" as const;
    default:
      return "muted" as const;
  }
}

function ageFrom(value: string | null) {
  if (!value) return null;

  const birth = new Date(`${value}T00:00:00`);
  if (Number.isNaN(birth.getTime())) return null;

  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();

  const month = today.getMonth() - birth.getMonth();

  if (
    month < 0 ||
    (month === 0 && today.getDate() < birth.getDate())
  ) {
    age--;
  }

  return age >= 0 ? age : null;
}

function formatCpf(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11);

  return digits
    .replace(/^(\d{3})(\d)/, "$1.$2")
    .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1-$2");
}

function formatPhone(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11);

  if (digits.length <= 10) {
    return digits
      .replace(/^(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{4})(\d)/, "$1-$2");
  }

  return digits
    .replace(/^(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d)/, "$1-$2");
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
  const router = useRouter();
  const { user, roles, loading: authLoading } = useAuth();

  const [clientes, setClientes] = useState<ClienteRow[]>([]);
  const [busca, setBusca] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const [modalVisible, setModalVisible] = useState(false);
  const [saving, setSaving] = useState(false);

  const [fullName, setFullName] = useState("");
  const [cpf, setCpf] = useState("");
  const [phone, setPhone] = useState("");
  const [birthDate, setBirthDate] = useState("");

  const canManage =
    roles.includes("admin") || roles.includes("profissional");

  const load = useCallback(
    async (refresh = false) => {
      if (authLoading) return;

      if (refresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      setError(null);

      const { data, error: queryError } = await supabase
        .from("clientes")
        .select(
          "id, full_name, social_name, cpf, phone, status, birth_date, created_at",
        )
        .order("full_name", { ascending: true });

      if (queryError) {
        setError(queryError);
        setClientes([]);
      } else {
        setClientes((data ?? []) as ClienteRow[]);
      }

      setIsLoading(false);
      setIsRefreshing(false);
    },
    [authLoading],
  );

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    const query = busca.trim().toLowerCase();

    if (!query) return clientes;

    return clientes.filter((cliente) => {
      return (
        cliente.full_name.toLowerCase().includes(query) ||
        (cliente.social_name ?? "").toLowerCase().includes(query) ||
        (cliente.cpf ?? "").includes(query) ||
        (cliente.phone ?? "").includes(query)
      );
    });
  }, [clientes, busca]);

  const resetForm = () => {
    setFullName("");
    setCpf("");
    setPhone("");
    setBirthDate("");
  };

  const createCliente = async () => {
    if (!user) return;

    const name = fullName.trim();

    if (!name) {
      return;
    }

    setSaving(true);

    const { data, error: insertError } = await supabase
      .from("clientes")
      .insert({
        created_by: user.id,
        full_name: name,
        cpf: cpf || null,
        phone: phone || null,
        birth_date: birthDate || null,
      })
      .select("id")
      .single();

    setSaving(false);

    if (insertError || !data) {
      return;
    }

    setModalVisible(false);
    resetForm();

    await load();

    router.push({
      pathname: "/cliente-detalhes",
      params: { clienteId: data.id },
    });
  };

  if (authLoading || isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Clientes</Text>
          <Text style={styles.subtitle}>
            Carteira de pacientes atendidos
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
          <Text style={styles.title}>Clientes</Text>
          <Text style={styles.subtitle}>
            Carteira de pacientes atendidos
          </Text>
        </View>

        <ErrorState message={error.message} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => {
              void load(true);
            }}
            tintColor={colors.primary}
          />
        }
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.title}>Clientes</Text>
          <Text style={styles.subtitle}>
            Carteira de pacientes atendidos
          </Text>
        </View>

        <View style={styles.searchRow}>
          <View style={styles.search}>
            <SearchInput
              value={busca}
              onChangeText={setBusca}
              placeholder="Buscar por nome, CPF ou telefone"
            />
          </View>

          {canManage && (
            <AppButton
              label="+"
              onPress={() => setModalVisible(true)}
            />
          )}
        </View>

        {filtered.length === 0 ? (
          <View style={styles.emptyContainer}>
            <EmptyState
              message={
                clientes.length === 0
                  ? "Nenhum cliente cadastrado ainda."
                  : "Nenhum cliente encontrado para essa busca."
              }
            />

            {canManage && clientes.length === 0 && (
              <AppButton
                label="Cadastrar primeiro cliente"
                onPress={() => setModalVisible(true)}
              />
            )}
          </View>
        ) : (
          <View style={styles.list}>
            {filtered.map((cliente) => {
              const age = ageFrom(cliente.birth_date);

              return (
                <Card key={cliente.id} style={styles.card}>
                  <View style={styles.clientRow}>
                    <InitialsAvatar
                      name={getInitials(cliente.full_name)}
                      size={42}
                    />

                    <View style={styles.clientMain}>
                      <Text
                        style={styles.clientName}
                        numberOfLines={1}
                      >
                        {cliente.full_name}
                      </Text>

                      <Text
                        style={styles.clientInfo}
                        numberOfLines={2}
                      >
                        {[
                          age !== null ? `${age} anos` : null,
                          cliente.cpf,
                          cliente.phone,
                        ]
                          .filter(Boolean)
                          .join(" · ") || "Sem dados complementares"}
                      </Text>
                    </View>

                    <Badge
                      label={
                        STATUS_LABEL[cliente.status ?? ""] ??
                        cliente.status ??
                        "—"
                      }
                      tone={statusTone(cliente.status)}
                    />
                  </View>

                  <AppButton
                    label="Abrir ficha"
                    variant="outline"
                    onPress={() =>
                      router.push({
                        pathname: "/cliente-detalhes",
                        params: { clienteId: cliente.id },
                      })
                    }
                  />
                </Card>
              );
            })}
          </View>
        )}
      </ScrollView>

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => {
          if (!saving) {
            setModalVisible(false);
          }
        }}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modal}>
            <ScrollView keyboardShouldPersistTaps="handled">
              <Text style={styles.modalTitle}>Novo cliente</Text>

              <Text style={styles.fieldLabel}>Nome completo</Text>
              <TextField
                value={fullName}
                onChangeText={setFullName}
                placeholder="Maria da Silva"
              />

              <Text style={styles.fieldLabel}>CPF</Text>
              <TextField
                value={cpf}
                onChangeText={(value) => setCpf(formatCpf(value))}
                placeholder="000.000.000-00"
                keyboardType="numeric"
              />

              <Text style={styles.fieldLabel}>Nascimento</Text>
              <TextField
                value={birthDate}
                onChangeText={setBirthDate}
                placeholder="AAAA-MM-DD"
              />

              <Text style={styles.fieldLabel}>Telefone</Text>
              <TextField
                value={phone}
                onChangeText={(value) => setPhone(formatPhone(value))}
                placeholder="(00) 00000-0000"
                keyboardType="phone-pad"
              />

              <View style={styles.modalActions}>
                <AppButton
                  label="Cancelar"
                  variant="outline"
                  disabled={saving}
                  onPress={() => {
                    setModalVisible(false);
                  }}
                />

                <AppButton
                  label={saving ? "Cadastrando..." : "Cadastrar"}
                  disabled={saving || !fullName.trim()}
                  onPress={() => {
                    void createCliente();
                  }}
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
  fieldLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 6,
  },

  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  content: {
    padding: 16,
    paddingBottom: 40,
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

  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 16,
  },

  search: {
    flex: 1,
  },

  emptyContainer: {
    gap: 16,
  },

  list: {
    gap: 10,
  },

  card: {
    gap: 14,
  },

  clientRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
  },

  clientMain: {
    flex: 1,
    minWidth: 0,
  },

  clientName: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.text,
  },

  clientInfo: {
    fontSize: 11,
    lineHeight: 16,
    color: colors.textMuted,
    marginTop: 3,
  },

  modalBackdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.45)",
  },

  modal: {
    maxHeight: "90%",
    backgroundColor: colors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.text,
    marginBottom: 18,
  },

  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 12,
  },
});
