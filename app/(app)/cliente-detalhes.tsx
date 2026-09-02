import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
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
import { Ionicons } from "@expo/vector-icons";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

type Sexo = "masculino" | "feminino" | "outro" | "nao_informado";
type Status = "ativo" | "inativo" | "em_avaliacao" | "alta";

type Cliente = {
  id: string;
  full_name: string;
  social_name: string | null;
  cpf: string | null;
  rg: string | null;
  birth_date: string | null;
  sexo: Sexo;
  phone: string | null;
  email: string | null;
  convenio: string | null;
  convenio_numero: string | null;
  cid: string | null;
  diagnostico: string | null;
  alergias: string | null;
  medicamentos_uso: string | null;
  mobilidade: string | null;
  observacoes: string | null;
  emergencia_nome: string | null;
  emergencia_telefone: string | null;
  status: Status;
};

type Endereco = {
  id: string;
  cliente_id: string;
  label: string | null;
  cep: string | null;
  logradouro: string | null;
  numero: string | null;
  complemento: string | null;
  bairro: string | null;
  cidade: string | null;
  estado: string | null;
  referencia: string | null;
  is_primary: boolean;
};

type Responsavel = {
  id: string;
  cliente_id: string;
  full_name: string;
  parentesco: string | null;
  phone: string | null;
  email: string | null;
  is_financeiro: boolean;
  pode_visualizar: boolean;
  pode_agendar: boolean;
};

type Plano = {
  id: string;
  cliente_id: string;
  author_id: string | null;
  titulo: string;
  objetivo: string | null;
  frequencia: string | null;
  cuidados: unknown;
  inicio: string | null;
  fim: string | null;
  status: string;
};

const SEXO_LABEL: Record<Sexo, string> = {
  masculino: "Masculino",
  feminino: "Feminino",
  outro: "Outro",
  nao_informado: "Não informado",
};

const STATUS_LABEL: Record<Status, string> = {
  ativo: "Ativo",
  inativo: "Inativo",
  em_avaliacao: "Em avaliação",
  alta: "Alta",
};

const PLANO_STATUS_LABEL: Record<string, string> = {
  ativo: "Ativo",
  concluido: "Concluído",
  cancelado: "Cancelado",
  encerrado: "Encerrado",
};

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

function formatCep(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  return digits.replace(/^(\d{5})(\d)/, "$1-$2");
}

function ageFromDate(value: string | null) {
  if (!value) return null;
  const birth = new Date(`${value}T00:00:00`);
  if (Number.isNaN(birth.getTime())) return null;

  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const month = now.getMonth() - birth.getMonth();

  if (month < 0 || (month === 0 && now.getDate() < birth.getDate())) {
    age--;
  }

  return age >= 0 ? age : null;
}

async function lookupCep(cep: string) {
  const clean = cep.replace(/\D/g, "");
  if (clean.length !== 8) return null;

  try {
    const response = await fetch(`https://viacep.com.br/ws/${clean}/json/`);
    if (!response.ok) return null;

    const data = await response.json();
    if (data.erro) return null;

    return data as {
      logradouro?: string;
      bairro?: string;
      localidade?: string;
      uf?: string;
      complemento?: string;
    };
  } catch {
    return null;
  }
}

function SectionTitle({
  icon,
  title,
  subtitle,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
}) {
  return (
    <View style={styles.sectionTitle}>
      <View style={styles.sectionIcon}>
        <Ionicons name={icon} size={19} color="#2F80ED" />
      </View>
      <View style={styles.sectionTitleText}>
        <Text style={styles.sectionTitleLabel}>{title}</Text>
        {subtitle ? <Text style={styles.sectionSubtitle}>{subtitle}</Text> : null}
      </View>
    </View>
  );
}

function Field({
  label,
  value,
  onChangeText,
  editable = true,
  multiline = false,
  keyboardType,
  placeholder,
  maxLength,
}: {
  label: string;
  value: string;
  onChangeText?: (value: string) => void;
  editable?: boolean;
  multiline?: boolean;
  keyboardType?: "default" | "numeric" | "email-address" | "phone-pad";
  placeholder?: string;
  maxLength?: number;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={[styles.input, multiline && styles.textarea, !editable && styles.inputDisabled]}
        value={value}
        onChangeText={onChangeText}
        editable={editable}
        multiline={multiline}
        keyboardType={keyboardType}
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        maxLength={maxLength}
        textAlignVertical={multiline ? "top" : "center"}
      />
    </View>
  );
}

function SelectField({
  label,
  value,
  options,
  editable,
  onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  editable: boolean;
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const selected = options.find((item) => item.value === value);

  return (
    <>
      <View style={styles.field}>
        <Text style={styles.fieldLabel}>{label}</Text>
        <Pressable
          disabled={!editable}
          onPress={() => setOpen(true)}
          style={[styles.input, styles.selectInput, !editable && styles.inputDisabled]}
        >
          <Text style={styles.selectText}>
            {selected?.label ?? "Selecione"}
          </Text>
          {editable ? (
            <Ionicons name="chevron-down" size={18} color="#6B7280" />
          ) : null}
        </Pressable>
      </View>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setOpen(false)}>
          <Pressable style={styles.modalCard} onPress={(event) => event.stopPropagation()}>
            <Text style={styles.modalTitle}>{label}</Text>
            {options.map((option) => (
              <Pressable
                key={option.value}
                style={styles.optionRow}
                onPress={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
              >
                <Text style={styles.optionText}>{option.label}</Text>
                {option.value === value ? (
                  <Ionicons name="checkmark" size={20} color="#2F80ED" />
                ) : null}
              </Pressable>
            ))}
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

function PrimaryButton({
  title,
  onPress,
  loading = false,
  outline = false,
  disabled = false,
  icon,
}: {
  title: string;
  onPress: () => void;
  loading?: boolean;
  outline?: boolean;
  disabled?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
}) {
  return (
    <Pressable
      disabled={disabled || loading}
      onPress={onPress}
      style={[
        styles.button,
        outline && styles.buttonOutline,
        (disabled || loading) && styles.buttonDisabled,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={outline ? "#2F80ED" : "#FFFFFF"} />
      ) : (
        <>
          {icon ? (
            <Ionicons
              name={icon}
              size={18}
              color={outline ? "#2F80ED" : "#FFFFFF"}
            />
          ) : null}
          <Text style={[styles.buttonText, outline && styles.buttonTextOutline]}>
            {title}
          </Text>
        </>
      )}
    </Pressable>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <View style={styles.empty}>
      <Ionicons name="document-text-outline" size={28} color="#9CA3AF" />
      <Text style={styles.emptyText}>{text}</Text>
    </View>
  );
}

export default function ClienteDetalhesScreen() {
  const params = useLocalSearchParams<{ id?: string; clienteId?: string }>();
  const router = useRouter();
  const { user, roles, loading: authLoading } = useAuth();

  const clienteId = params.id ?? params.clienteId;

  const canManage = useMemo(
    () => roles.includes("admin") || roles.includes("profissional"),
    [roles],
  );

  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [endereco, setEndereco] = useState<Endereco | null>(null);
  const [responsaveis, setResponsaveis] = useState<Responsavel[]>([]);
  const [planos, setPlanos] = useState<Plano[]>([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [cepLoading, setCepLoading] = useState(false);

  const [tab, setTab] = useState<"dados" | "endereco" | "responsaveis" | "plano">("dados");

  const [respOpen, setRespOpen] = useState(false);
  const [respForm, setRespForm] = useState({
    full_name: "",
    parentesco: "",
    phone: "",
    email: "",
    is_financeiro: false,
    pode_visualizar: true,
    pode_agendar: false,
  });

  const [planoOpen, setPlanoOpen] = useState(false);
  const [planoForm, setPlanoForm] = useState({
    titulo: "",
    objetivo: "",
    frequencia: "",
    cuidados: "",
    inicio: "",
    fim: "",
  });

  const load = useCallback(async () => {
    if (!clienteId) {
      setCliente(null);
      setLoading(false);
      return;
    }

    setLoading(true);

    const [c, e, r, p] = await Promise.all([
      supabase.from("clientes").select("*").eq("id", clienteId).maybeSingle(),
      supabase
        .from("cliente_enderecos")
        .select("*")
        .eq("cliente_id", clienteId)
        .order("is_primary", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from("cliente_responsaveis")
        .select("*")
        .eq("cliente_id", clienteId)
        .order("created_at", { ascending: true }),
      supabase
        .from("planos_de_cuidado")
        .select("*")
        .eq("cliente_id", clienteId)
        .order("created_at", { ascending: false }),
    ]);

    if (c.error) {
      console.error("Erro ao carregar cliente:", c.error);
    }
    if (e.error) {
      console.error("Erro ao carregar endereço:", e.error);
    }
    if (r.error) {
      console.error("Erro ao carregar responsáveis:", r.error);
    }
    if (p.error) {
      console.error("Erro ao carregar planos:", p.error);
    }

    setCliente((c.data as Cliente | null) ?? null);
    setEndereco((e.data as Endereco | null) ?? null);
    setResponsaveis((r.data as Responsavel[] | null) ?? []);
    setPlanos((p.data as Plano[] | null) ?? []);
    setLoading(false);
  }, [clienteId]);

  useEffect(() => {
    if (!authLoading) {
      void load();
    }
  }, [authLoading, load]);

  function setField<K extends keyof Cliente>(key: K, value: Cliente[K]) {
    setCliente((current) =>
      current ? { ...current, [key]: value } : current,
    );
  }

  function setEnd<K extends keyof Endereco>(key: K, value: Endereco[K]) {
    setEndereco((current) =>
      current
        ? { ...current, [key]: value }
        : ({
            id: "",
            cliente_id: clienteId ?? "",
            label: "Residência",
            cep: null,
            logradouro: null,
            numero: null,
            complemento: null,
            bairro: null,
            cidade: null,
            estado: null,
            referencia: null,
            is_primary: true,
            [key]: value,
          } as Endereco),
    );
  }

  async function saveCliente() {
    if (!cliente || !canManage) return;

    if (!cliente.full_name.trim()) {
      Alert.alert("Atenção", "Informe o nome completo do cliente.");
      return;
    }

    setSaving(true);

    const { error } = await supabase
      .from("clientes")
      .update({
        full_name: cliente.full_name.trim(),
        social_name: cliente.social_name,
        cpf: cliente.cpf,
        rg: cliente.rg,
        birth_date: cliente.birth_date || null,
        sexo: cliente.sexo,
        phone: cliente.phone,
        email: cliente.email,
        convenio: cliente.convenio,
        convenio_numero: cliente.convenio_numero,
        cid: cliente.cid,
        diagnostico: cliente.diagnostico,
        alergias: cliente.alergias,
        medicamentos_uso: cliente.medicamentos_uso,
        mobilidade: cliente.mobilidade,
        observacoes: cliente.observacoes,
        emergencia_nome: cliente.emergencia_nome,
        emergencia_telefone: cliente.emergencia_telefone,
        status: cliente.status,
      })
      .eq("id", cliente.id);

    setSaving(false);

    if (error) {
      Alert.alert("Erro", "Não foi possível salvar os dados.");
      return;
    }

    Alert.alert("Sucesso", "Dados do cliente salvos.");
  }

  async function buscarCep() {
    if (!endereco?.cep || !canManage) return;

    setCepLoading(true);
    const found = await lookupCep(endereco.cep);
    setCepLoading(false);

    if (!found) {
      Alert.alert("CEP", "CEP não encontrado.");
      return;
    }

    setEndereco((current) =>
      current
        ? {
            ...current,
            logradouro: found.logradouro || current.logradouro,
            bairro: found.bairro || current.bairro,
            cidade: found.localidade || current.cidade,
            estado: found.uf || current.estado,
            complemento:
              current.complemento || found.complemento || null,
          }
        : current,
    );

    Alert.alert("CEP", "Endereço preenchido pelo CEP.");
  }

  async function saveEndereco() {
    if (!endereco || !clienteId || !canManage) return;

    setSaving(true);

    const payload = {
      cliente_id: clienteId,
      label: endereco.label ?? "Residência",
      cep: endereco.cep,
      logradouro: endereco.logradouro,
      numero: endereco.numero,
      complemento: endereco.complemento,
      bairro: endereco.bairro,
      cidade: endereco.cidade,
      estado: endereco.estado,
      referencia: endereco.referencia,
      is_primary: true,
    };

    const result = endereco.id
      ? await supabase
          .from("cliente_enderecos")
          .update(payload)
          .eq("id", endereco.id)
          .select("*")
          .single()
      : await supabase
          .from("cliente_enderecos")
          .insert(payload)
          .select("*")
          .single();

    setSaving(false);

    if (result.error || !result.data) {
      Alert.alert("Erro", "Não foi possível salvar o endereço.");
      return;
    }

    setEndereco(result.data as Endereco);
    Alert.alert("Sucesso", "Endereço salvo.");
  }

  async function addResponsavel() {
    if (!clienteId || !canManage) return;

    if (!respForm.full_name.trim()) {
      Alert.alert("Atenção", "Informe o nome do responsável.");
      return;
    }

    const { data, error } = await supabase
      .from("cliente_responsaveis")
      .insert({
        cliente_id: clienteId,
        full_name: respForm.full_name.trim(),
        parentesco: respForm.parentesco || null,
        phone: respForm.phone || null,
        email: respForm.email || null,
        is_financeiro: respForm.is_financeiro,
        pode_visualizar: respForm.pode_visualizar,
        pode_agendar: respForm.pode_agendar,
      })
      .select("*")
      .single();

    if (error || !data) {
      Alert.alert("Erro", "Não foi possível adicionar o responsável.");
      return;
    }

    setResponsaveis((list) => [...list, data as Responsavel]);
    setRespOpen(false);

    setRespForm({
      full_name: "",
      parentesco: "",
      phone: "",
      email: "",
      is_financeiro: false,
      pode_visualizar: true,
      pode_agendar: false,
    });

    Alert.alert("Sucesso", "Responsável adicionado.");
  }

  async function removeResponsavel(id: string) {
    if (!canManage) return;

    Alert.alert(
      "Remover responsável",
      "Deseja realmente remover este responsável?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Remover",
          style: "destructive",
          onPress: async () => {
            const { error } = await supabase
              .from("cliente_responsaveis")
              .delete()
              .eq("id", id);

            if (error) {
              Alert.alert("Erro", "Não foi possível remover.");
              return;
            }

            setResponsaveis((list) => list.filter((item) => item.id !== id));
          },
        },
      ],
    );
  }

  async function addPlano() {
    if (!clienteId || !canManage) return;

    if (!planoForm.titulo.trim()) {
      Alert.alert("Atenção", "Informe o título do plano.");
      return;
    }

    const cuidados = planoForm.cuidados
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean);

    const { data, error } = await supabase
      .from("planos_de_cuidado")
      .insert({
        cliente_id: clienteId,
        author_id: user?.id ?? null,
        titulo: planoForm.titulo.trim(),
        objetivo: planoForm.objetivo || null,
        frequencia: planoForm.frequencia || null,
        cuidados,
        inicio: planoForm.inicio || null,
        fim: planoForm.fim || null,
      })
      .select("*")
      .single();

    if (error || !data) {
      Alert.alert("Erro", "Não foi possível salvar o plano de cuidados.");
      return;
    }

    setPlanos((list) => [data as Plano, ...list]);
    setPlanoOpen(false);

    setPlanoForm({
      titulo: "",
      objetivo: "",
      frequencia: "",
      cuidados: "",
      inicio: "",
      fim: "",
    });

    Alert.alert("Sucesso", "Plano de cuidados criado.");
  }

  async function removePlano(id: string) {
    if (!canManage) return;

    Alert.alert(
      "Remover plano",
      "Deseja realmente remover este plano de cuidados?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Remover",
          style: "destructive",
          onPress: async () => {
            const { error } = await supabase
              .from("planos_de_cuidado")
              .delete()
              .eq("id", id);

            if (error) {
              Alert.alert("Erro", "Não foi possível remover o plano.");
              return;
            }

            setPlanos((list) => list.filter((item) => item.id !== id));
          },
        },
      ],
    );
  }

  const age = ageFromDate(cliente?.birth_date ?? null);

  if (authLoading || loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2F80ED" />
        <Text style={styles.loadingText}>Carregando ficha do cliente...</Text>
      </View>
    );
  }

  if (!cliente) {
    return (
      <View style={styles.screen}>
        <View style={styles.header}>
          <Pressable onPress={() => router.replace("/clientes")} style={styles.backButton}>
            <Ionicons name="arrow-back" size={23} color="#111827" />
          </Pressable>
          <View>
            <Text style={styles.headerTitle}>Cliente</Text>
            <Text style={styles.headerSubtitle}>Ficha do cliente</Text>
          </View>
        </View>

        <View style={styles.notFound}>
          <Ionicons name="person-outline" size={42} color="#9CA3AF" />
          <Text style={styles.notFoundTitle}>Cliente não encontrado</Text>
          <Text style={styles.notFoundText}>
            Cliente não encontrado ou sem permissão de acesso.
          </Text>
          <PrimaryButton
            title="Voltar para clientes"
            icon="arrow-back"
            onPress={() => router.replace("/clientes")}
          />
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.header}>
        <Pressable onPress={() => router.replace("/clientes")} style={styles.backButton}>
          <Ionicons name="arrow-back" size={23} color="#111827" />
        </Pressable>

        <View style={styles.headerMain}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {cliente.full_name}
          </Text>
          <Text style={styles.headerSubtitle}>
            Ficha do cliente{age !== null ? ` · ${age} anos` : ""}
          </Text>
        </View>

        <View style={styles.statusPill}>
          <Text style={styles.statusPillText}>
            {STATUS_LABEL[cliente.status] ?? cliente.status}
          </Text>
        </View>
      </View>

      <View style={styles.tabs}>
        {[
          ["dados", "Dados", "person-outline"],
          ["endereco", "Endereço", "location-outline"],
          ["responsaveis", "Resp.", "people-outline"],
          ["plano", "Plano", "clipboard-outline"],
        ].map(([value, label, icon]) => {
          const active = tab === value;
          return (
            <Pressable
              key={value}
              onPress={() => setTab(value as typeof tab)}
              style={[styles.tab, active && styles.tabActive]}
            >
              <Ionicons
                name={icon as keyof typeof Ionicons.glyphMap}
                size={16}
                color={active ? "#2F80ED" : "#6B7280"}
              />
              <Text style={[styles.tabText, active && styles.tabTextActive]}>
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={async () => {
              setRefreshing(true);
              await load();
              setRefreshing(false);
            }}
            tintColor="#2F80ED"
          />
        }
        keyboardShouldPersistTaps="handled"
      >
        {tab === "dados" && (
          <View>
            <SectionTitle
              icon="person-outline"
              title="Dados pessoais"
              subtitle={canManage ? "Você pode editar esta ficha" : "Modo somente leitura"}
            />

            <Field
              label="Nome completo"
              value={cliente.full_name}
              editable={canManage}
              onChangeText={(value) => setField("full_name", value)}
            />

            <View style={styles.row}>
              <View style={styles.half}>
                <Field
                  label="CPF"
                  value={cliente.cpf ?? ""}
                  editable={canManage}
                  keyboardType="numeric"
                  onChangeText={(value) => setField("cpf", formatCpf(value))}
                />
              </View>
              <View style={styles.half}>
                <Field
                  label="RG"
                  value={cliente.rg ?? ""}
                  editable={canManage}
                  onChangeText={(value) => setField("rg", value)}
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.half}>
                <Field
                  label="Nascimento"
                  value={cliente.birth_date ?? ""}
                  editable={canManage}
                  placeholder="AAAA-MM-DD"
                  onChangeText={(value) => setField("birth_date", value)}
                />
              </View>
              <View style={styles.half}>
                <SelectField
                  label="Sexo"
                  value={cliente.sexo}
                  editable={canManage}
                  onChange={(value) => setField("sexo", value as Sexo)}
                  options={Object.entries(SEXO_LABEL).map(([value, label]) => ({
                    value,
                    label,
                  }))}
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.half}>
                <Field
                  label="Telefone"
                  value={cliente.phone ?? ""}
                  editable={canManage}
                  keyboardType="phone-pad"
                  onChangeText={(value) => setField("phone", formatPhone(value))}
                />
              </View>
              <View style={styles.half}>
                <Field
                  label="E-mail"
                  value={cliente.email ?? ""}
                  editable={canManage}
                  keyboardType="email-address"
                  onChangeText={(value) => setField("email", value)}
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.half}>
                <Field
                  label="Convênio"
                  value={cliente.convenio ?? ""}
                  editable={canManage}
                  onChangeText={(value) => setField("convenio", value)}
                />
              </View>
              <View style={styles.half}>
                <Field
                  label="Nº carteirinha"
                  value={cliente.convenio_numero ?? ""}
                  editable={canManage}
                  onChangeText={(value) => setField("convenio_numero", value)}
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.half}>
                <Field
                  label="CID"
                  value={cliente.cid ?? ""}
                  editable={canManage}
                  placeholder="Ex.: I10"
                  onChangeText={(value) => setField("cid", value)}
                />
              </View>
              <View style={styles.half}>
                <SelectField
                  label="Status"
                  value={cliente.status}
                  editable={canManage}
                  onChange={(value) => setField("status", value as Status)}
                  options={Object.entries(STATUS_LABEL).map(([value, label]) => ({
                    value,
                    label,
                  }))}
                />
              </View>
            </View>

            <Field
              label="Diagnóstico"
              value={cliente.diagnostico ?? ""}
              editable={canManage}
              multiline
              onChangeText={(value) => setField("diagnostico", value)}
            />

            <Field
              label="Alergias"
              value={cliente.alergias ?? ""}
              editable={canManage}
              multiline
              onChangeText={(value) => setField("alergias", value)}
            />

            <Field
              label="Medicamentos em uso"
              value={cliente.medicamentos_uso ?? ""}
              editable={canManage}
              multiline
              onChangeText={(value) => setField("medicamentos_uso", value)}
            />

            <Field
              label="Mobilidade"
              value={cliente.mobilidade ?? ""}
              editable={canManage}
              placeholder="Acamado, cadeirante, deambula com apoio..."
              onChangeText={(value) => setField("mobilidade", value)}
            />

            <View style={styles.row}>
              <View style={styles.half}>
                <Field
                  label="Contato de emergência"
                  value={cliente.emergencia_nome ?? ""}
                  editable={canManage}
                  onChangeText={(value) => setField("emergencia_nome", value)}
                />
              </View>
              <View style={styles.half}>
                <Field
                  label="Telefone emergência"
                  value={cliente.emergencia_telefone ?? ""}
                  editable={canManage}
                  keyboardType="phone-pad"
                  onChangeText={(value) =>
                    setField("emergencia_telefone", formatPhone(value))
                  }
                />
              </View>
            </View>

            <Field
              label="Observações"
              value={cliente.observacoes ?? ""}
              editable={canManage}
              multiline
              onChangeText={(value) => setField("observacoes", value)}
            />

            {canManage ? (
              <PrimaryButton
                title="Salvar dados"
                icon="save-outline"
                onPress={() => void saveCliente()}
                loading={saving}
              />
            ) : null}
          </View>
        )}

        {tab === "endereco" && (
          <View>
            <SectionTitle
              icon="location-outline"
              title="Endereço"
              subtitle="Endereço principal do cliente"
            />

            <View style={styles.cepRow}>
              <View style={styles.cepInput}>
                <Field
                  label="CEP"
                  value={endereco?.cep ?? ""}
                  editable={canManage}
                  keyboardType="numeric"
                  placeholder="00000-000"
                  onChangeText={(value) => setEnd("cep", formatCep(value))}
                />
              </View>
              <Pressable
                disabled={!canManage || cepLoading}
                onPress={() => void buscarCep()}
                style={[
                  styles.cepButton,
                  (!canManage || cepLoading) && styles.buttonDisabled,
                ]}
              >
                {cepLoading ? (
                  <ActivityIndicator color="#2F80ED" />
                ) : (
                  <Ionicons name="search" size={21} color="#2F80ED" />
                )}
              </Pressable>
            </View>

            <View style={styles.row}>
              <View style={styles.twoThirds}>
                <Field
                  label="Rua"
                  value={endereco?.logradouro ?? ""}
                  editable={canManage}
                  onChangeText={(value) => setEnd("logradouro", value)}
                />
              </View>
              <View style={styles.oneThird}>
                <Field
                  label="Número"
                  value={endereco?.numero ?? ""}
                  editable={canManage}
                  onChangeText={(value) => setEnd("numero", value)}
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.half}>
                <Field
                  label="Complemento"
                  value={endereco?.complemento ?? ""}
                  editable={canManage}
                  onChangeText={(value) => setEnd("complemento", value)}
                />
              </View>
              <View style={styles.half}>
                <Field
                  label="Bairro"
                  value={endereco?.bairro ?? ""}
                  editable={canManage}
                  onChangeText={(value) => setEnd("bairro", value)}
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.twoThirds}>
                <Field
                  label="Cidade"
                  value={endereco?.cidade ?? ""}
                  editable={canManage}
                  onChangeText={(value) => setEnd("cidade", value)}
                />
              </View>
              <View style={styles.oneThird}>
                <Field
                  label="UF"
                  value={endereco?.estado ?? ""}
                  editable={canManage}
                  maxLength={2}
                  onChangeText={(value) =>
                    setEnd("estado", value.toUpperCase())
                  }
                />
              </View>
            </View>

            <Field
              label="Ponto de referência"
              value={endereco?.referencia ?? ""}
              editable={canManage}
              onChangeText={(value) => setEnd("referencia", value)}
            />

            {!endereco && !canManage ? (
              <EmptyState text="Nenhum endereço cadastrado." />
            ) : null}

            {canManage ? (
              <PrimaryButton
                title="Salvar endereço"
                icon="save-outline"
                onPress={() => void saveEndereco()}
                loading={saving}
              />
            ) : null}
          </View>
        )}

        {tab === "responsaveis" && (
          <View>
            <SectionTitle
              icon="people-outline"
              title="Responsáveis"
              subtitle="Pessoas autorizadas relacionadas ao cliente"
            />

            {canManage ? (
              <PrimaryButton
                title="Adicionar responsável"
                icon="add"
                outline
                onPress={() => setRespOpen(true)}
              />
            ) : null}

            {responsaveis.length === 0 ? (
              <EmptyState text="Nenhum responsável cadastrado." />
            ) : (
              responsaveis.map((item) => (
                <View key={item.id} style={styles.itemCard}>
                  <View style={styles.itemMain}>
                    <Text style={styles.itemTitle}>{item.full_name}</Text>
                    <Text style={styles.itemSubtitle}>
                      {[
                        item.parentesco,
                        item.phone,
                        item.email,
                      ]
                        .filter(Boolean)
                        .join(" · ") || "Sem contato"}
                    </Text>

                    <View style={styles.badges}>
                      {item.pode_visualizar ? (
                        <View style={styles.badge}>
                          <Text style={styles.badgeText}>Visualiza</Text>
                        </View>
                      ) : null}
                      {item.pode_agendar ? (
                        <View style={styles.badge}>
                          <Text style={styles.badgeText}>Agenda</Text>
                        </View>
                      ) : null}
                      {item.is_financeiro ? (
                        <View style={styles.badge}>
                          <Text style={styles.badgeText}>Financeiro</Text>
                        </View>
                      ) : null}
                    </View>
                  </View>

                  {canManage ? (
                    <Pressable
                      onPress={() => void removeResponsavel(item.id)}
                      style={styles.deleteButton}
                    >
                      <Ionicons name="trash-outline" size={19} color="#EB5757" />
                    </Pressable>
                  ) : null}
                </View>
              ))
            )}
          </View>
        )}

        {tab === "plano" && (
          <View>
            <SectionTitle
              icon="clipboard-outline"
              title="Plano de cuidados"
              subtitle="Planos registrados para este cliente"
            />

            {canManage ? (
              <PrimaryButton
                title="Novo plano de cuidados"
                icon="add"
                outline
                onPress={() => setPlanoOpen(true)}
              />
            ) : null}

            {planos.length === 0 ? (
              <EmptyState text="Nenhum plano de cuidados registrado." />
            ) : (
              planos.map((item) => {
                const cuidados = Array.isArray(item.cuidados)
                  ? (item.cuidados as string[])
                  : [];

                return (
                  <View key={item.id} style={styles.itemCard}>
                    <View style={styles.itemMain}>
                      <View style={styles.planTitleRow}>
                        <Text style={styles.itemTitle}>{item.titulo}</Text>
                        <View style={styles.planStatus}>
                          <Text style={styles.planStatusText}>
                            {PLANO_STATUS_LABEL[item.status] ?? item.status}
                          </Text>
                        </View>
                      </View>

                      {item.objetivo ? (
                        <Text style={styles.itemSubtitle}>{item.objetivo}</Text>
                      ) : null}

                      {item.frequencia ? (
                        <Text style={styles.planFrequency}>
                          Frequência: {item.frequencia}
                        </Text>
                      ) : null}

                      {cuidados.length > 0 ? (
                        <View style={styles.careList}>
                          {cuidados.map((care, index) => (
                            <Text key={`${item.id}-${index}`} style={styles.careItem}>
                              • {care}
                            </Text>
                          ))}
                        </View>
                      ) : null}
                    </View>

                    {canManage ? (
                      <Pressable
                        onPress={() => void removePlano(item.id)}
                        style={styles.deleteButton}
                      >
                        <Ionicons name="trash-outline" size={19} color="#EB5757" />
                      </Pressable>
                    ) : null}
                  </View>
                );
              })
            )}
          </View>
        )}
      </ScrollView>

      <Modal
        visible={respOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setRespOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Novo responsável</Text>
              <Pressable onPress={() => setRespOpen(false)}>
                <Ionicons name="close" size={24} color="#111827" />
              </Pressable>
            </View>

            <ScrollView keyboardShouldPersistTaps="handled">
              <Field
                label="Nome"
                value={respForm.full_name}
                onChangeText={(value) =>
                  setRespForm((current) => ({ ...current, full_name: value }))
                }
              />

              <View style={styles.row}>
                <View style={styles.half}>
                  <Field
                    label="Parentesco"
                    value={respForm.parentesco}
                    placeholder="Filha, cônjuge..."
                    onChangeText={(value) =>
                      setRespForm((current) => ({ ...current, parentesco: value }))
                    }
                  />
                </View>
                <View style={styles.half}>
                  <Field
                    label="Telefone"
                    value={respForm.phone}
                    keyboardType="phone-pad"
                    onChangeText={(value) =>
                      setRespForm((current) => ({
                        ...current,
                        phone: formatPhone(value),
                      }))
                    }
                  />
                </View>
              </View>

              <Field
                label="E-mail"
                value={respForm.email}
                keyboardType="email-address"
                onChangeText={(value) =>
                  setRespForm((current) => ({ ...current, email: value }))
                }
              />

              <View style={styles.switchBox}>
                <View style={styles.switchRow}>
                  <Text style={styles.switchLabel}>Pode visualizar a ficha</Text>
                  <Switch
                    value={respForm.pode_visualizar}
                    onValueChange={(value) =>
                      setRespForm((current) => ({
                        ...current,
                        pode_visualizar: value,
                      }))
                    }
                  />
                </View>

                <View style={styles.switchRow}>
                  <Text style={styles.switchLabel}>Pode agendar atendimentos</Text>
                  <Switch
                    value={respForm.pode_agendar}
                    onValueChange={(value) =>
                      setRespForm((current) => ({
                        ...current,
                        pode_agendar: value,
                      }))
                    }
                  />
                </View>

                <View style={styles.switchRow}>
                  <Text style={styles.switchLabel}>Responsável financeiro</Text>
                  <Switch
                    value={respForm.is_financeiro}
                    onValueChange={(value) =>
                      setRespForm((current) => ({
                        ...current,
                        is_financeiro: value,
                      }))
                    }
                  />
                </View>
              </View>

              <View style={styles.modalActions}>
                <PrimaryButton
                  title="Cancelar"
                  outline
                  onPress={() => setRespOpen(false)}
                />
                <PrimaryButton
                  title="Adicionar"
                  onPress={() => void addResponsavel()}
                />
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal
        visible={planoOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setPlanoOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Plano de cuidados</Text>
              <Pressable onPress={() => setPlanoOpen(false)}>
                <Ionicons name="close" size={24} color="#111827" />
              </Pressable>
            </View>

            <ScrollView keyboardShouldPersistTaps="handled">
              <Field
                label="Título"
                value={planoForm.titulo}
                placeholder="Cuidados pós-alta hospitalar"
                onChangeText={(value) =>
                  setPlanoForm((current) => ({ ...current, titulo: value }))
                }
              />

              <Field
                label="Objetivo"
                value={planoForm.objetivo}
                multiline
                onChangeText={(value) =>
                  setPlanoForm((current) => ({ ...current, objetivo: value }))
                }
              />

              <Field
                label="Frequência"
                value={planoForm.frequencia}
                placeholder="3x por semana, 12h/dia..."
                onChangeText={(value) =>
                  setPlanoForm((current) => ({ ...current, frequencia: value }))
                }
              />

              <Field
                label="Cuidados (um por linha)"
                value={planoForm.cuidados}
                multiline
                placeholder={"Troca de curativo\nControle de glicemia\nAuxílio no banho"}
                onChangeText={(value) =>
                  setPlanoForm((current) => ({ ...current, cuidados: value }))
                }
              />

              <View style={styles.row}>
                <View style={styles.half}>
                  <Field
                    label="Início"
                    value={planoForm.inicio}
                    placeholder="AAAA-MM-DD"
                    onChangeText={(value) =>
                      setPlanoForm((current) => ({ ...current, inicio: value }))
                    }
                  />
                </View>
                <View style={styles.half}>
                  <Field
                    label="Fim"
                    value={planoForm.fim}
                    placeholder="AAAA-MM-DD"
                    onChangeText={(value) =>
                      setPlanoForm((current) => ({ ...current, fim: value }))
                    }
                  />
                </View>
              </View>

              <View style={styles.modalActions}>
                <PrimaryButton
                  title="Cancelar"
                  outline
                  onPress={() => setPlanoOpen(false)}
                />
                <PrimaryButton
                  title="Salvar plano"
                  onPress={() => void addPlano()}
                />
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F5F7FA",
  },
  loadingText: {
    marginTop: 10,
    color: "#6B7280",
    fontSize: 13,
  },
  header: {
    minHeight: 76,
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "ios" ? 12 : 10,
    paddingBottom: 10,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F3F4F6",
  },
  headerMain: {
    flex: 1,
    minWidth: 0,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
  },
  headerSubtitle: {
    marginTop: 2,
    fontSize: 12,
    color: "#6B7280",
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#E8F5EE",
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#27AE60",
  },
  tabs: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    flexDirection: "row",
    gap: 5,
  },
  tab: {
    flex: 1,
    minHeight: 42,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 4,
  },
  tabActive: {
    backgroundColor: "#EAF3FF",
  },
  tabText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#6B7280",
  },
  tabTextActive: {
    color: "#2F80ED",
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  sectionTitle: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EAF3FF",
  },
  sectionTitleText: {
    marginLeft: 10,
    flex: 1,
  },
  sectionTitleLabel: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111827",
  },
  sectionSubtitle: {
    marginTop: 2,
    fontSize: 12,
    color: "#6B7280",
  },
  field: {
    marginBottom: 13,
  },
  fieldLabel: {
    marginBottom: 6,
    fontSize: 12,
    fontWeight: "700",
    color: "#374151",
  },
  input: {
    minHeight: 46,
    paddingHorizontal: 13,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 11,
    backgroundColor: "#FFFFFF",
    color: "#111827",
    fontSize: 14,
  },
  textarea: {
    minHeight: 88,
    paddingTop: 12,
  },
  inputDisabled: {
    backgroundColor: "#F3F4F6",
    color: "#6B7280",
  },
  selectInput: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  selectText: {
    color: "#111827",
    fontSize: 14,
  },
  row: {
    flexDirection: "row",
    gap: 10,
  },
  half: {
    flex: 1,
  },
  twoThirds: {
    flex: 2,
  },
  oneThird: {
    flex: 1,
  },
  button: {
    minHeight: 48,
    marginTop: 5,
    marginBottom: 12,
    borderRadius: 11,
    paddingHorizontal: 16,
    backgroundColor: "#2F80ED",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  buttonOutline: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#2F80ED",
  },
  buttonDisabled: {
    opacity: 0.55,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },
  buttonTextOutline: {
    color: "#2F80ED",
  },
  cepRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
  },
  cepInput: {
    flex: 1,
  },
  cepButton: {
    width: 48,
    height: 46,
    marginBottom: 13,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  empty: {
    marginTop: 10,
    minHeight: 130,
    borderRadius: 14,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#D1D5DB",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  emptyText: {
    marginTop: 8,
    color: "#6B7280",
    fontSize: 13,
    textAlign: "center",
  },
  itemCard: {
    marginTop: 10,
    padding: 14,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  itemMain: {
    flex: 1,
    minWidth: 0,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#111827",
  },
  itemSubtitle: {
    marginTop: 4,
    fontSize: 12,
    lineHeight: 18,
    color: "#6B7280",
  },
  badges: {
    marginTop: 9,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 5,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "#EEF2F7",
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#4B5563",
  },
  deleteButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FEF2F2",
  },
  planTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  planStatus: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: "#EAF3FF",
  },
  planStatusText: {
    fontSize: 9,
    fontWeight: "800",
    color: "#2F80ED",
  },
  planFrequency: {
    marginTop: 5,
    fontSize: 11,
    color: "#6B7280",
  },
  careList: {
    marginTop: 8,
    gap: 3,
  },
  careItem: {
    fontSize: 12,
    lineHeight: 18,
    color: "#4B5563",
  },
  notFound: {
    margin: 16,
    padding: 28,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignItems: "center",
  },
  notFoundTitle: {
    marginTop: 10,
    fontSize: 17,
    fontWeight: "800",
    color: "#111827",
  },
  notFoundText: {
    marginTop: 5,
    marginBottom: 18,
    fontSize: 13,
    lineHeight: 19,
    textAlign: "center",
    color: "#6B7280",
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },
  modalCard: {
    margin: 20,
    padding: 18,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
  },
  modalSheet: {
    maxHeight: "92%",
    padding: 18,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    backgroundColor: "#FFFFFF",
  },
  modalHeader: {
    marginBottom: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
  },
  optionRow: {
    minHeight: 48,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  optionText: {
    fontSize: 14,
    color: "#111827",
  },
  switchBox: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
    marginBottom: 10,
  },
  switchRow: {
    minHeight: 46,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  switchLabel: {
    flex: 1,
    paddingRight: 10,
    fontSize: 13,
    color: "#374151",
  },
  modalActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 5,
  },
});
