// Porta completa de src/routes/_authenticated/agenda.tsx: agenda por dia
// (faixa de 14 dias), lista de atendimentos do dia selecionado com dados
// reais da tabela `appointments`, e modal nativo de novo agendamento com
// os mesmos campos/validação do original.
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Stack } from "expo-router";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/auth-context";
import { colors } from "@/theme/colors";
import { AppButton, Badge, Card, LoadingState, toneForStatus } from "@/components/ui/Kit";

type AppointmentType = "domiciliar" | "teleconsulta" | "presencial";
type AppointmentStatus = "agendado" | "confirmado" | "concluido" | "cancelado";

interface Appointment {
  id: string;
  patient_id: string;
  professional_id: string | null;
  title: string;
  description: string | null;
  address: string | null;
  type: AppointmentType;
  status: AppointmentStatus;
  scheduled_at: string;
  duration_minutes: number;
}

const TYPE_LABEL: Record<AppointmentType, string> = {
  domiciliar: "Domiciliar",
  teleconsulta: "Teleconsulta",
  presencial: "Presencial",
};

export default function AgendaScreen() {
  const { user, role } = useAuth();
  const [items, setItems] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDayIdx, setSelectedDayIdx] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);
  const days = useMemo(
    () =>
      Array.from({ length: 14 }).map((_, i) => {
        const d = new Date(today);
        d.setDate(today.getDate() + i);
        return d;
      }),
    [today],
  );

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("appointments")
      .select("*")
      .order("scheduled_at", { ascending: true });
    if (error) Alert.alert("Erro ao carregar agenda", error.message);
    setItems((data as Appointment[] | null) ?? []);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    void load();
  }, [load]);

  const selectedDay = days[selectedDayIdx];
  const dayItems = items.filter((a) => sameDay(new Date(a.scheduled_at), selectedDay));

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: "Agenda",
          headerRight: () => (
            <Pressable onPress={() => setDialogOpen(true)} style={styles.headerBtn}>
              <Text style={styles.headerBtnText}>+ Novo</Text>
            </Pressable>
          ),
        }}
      />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dayStrip} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
        {days.map((d, i) => {
          const active = i === selectedDayIdx;
          const count = items.filter((a) => sameDay(new Date(a.scheduled_at), d)).length;
          return (
            <Pressable key={i} onPress={() => setSelectedDayIdx(i)} style={[styles.dayChip, active && styles.dayChipActive]}>
              <Text style={[styles.dayChipWeekday, active && styles.dayChipTextActive]}>
                {d.toLocaleDateString("pt-BR", { weekday: "short" }).replace(".", "")}
              </Text>
              <Text style={[styles.dayChipDate, active && styles.dayChipTextActive]}>{d.getDate()}</Text>
              {count > 0 && (
                <View style={[styles.dayChipBadge, active && styles.dayChipBadgeActive]}>
                  <Text style={[styles.dayChipBadgeText, active && { color: colors.primary }]}>{count}</Text>
                </View>
              )}
            </Pressable>
          );
        })}
      </ScrollView>

      {loading ? (
        <LoadingState />
      ) : (
        <FlatList
          data={dayItems}
          keyExtractor={(it) => it.id}
          contentContainerStyle={{ padding: 16, paddingTop: 12, paddingBottom: 32 }}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyText}>Nenhum atendimento neste dia.</Text>
              <View style={{ marginTop: 12 }}>
                <AppButton label="Agendar" variant="outline" onPress={() => setDialogOpen(true)} />
              </View>
            </View>
          }
          renderItem={({ item }) => {
            const d = new Date(item.scheduled_at);
            const time = d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
            return (
              <Card style={{ marginBottom: 10, flexDirection: "row", gap: 12 }}>
                <View style={{ width: 54 }}>
                  <Text style={styles.time}>{time}</Text>
                  <Text style={styles.duration}>{item.duration_minutes} min</Text>
                </View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={styles.evTitle} numberOfLines={1}>
                    {item.title}
                  </Text>
                  <Text style={styles.evSub} numberOfLines={1}>
                    {item.address ?? item.description ?? TYPE_LABEL[item.type]}
                  </Text>
                  <View style={{ marginTop: 6, flexDirection: "row", gap: 6 }}>
                    <Badge label={item.status} tone={toneForStatus(item.status)} />
                    <Badge label={TYPE_LABEL[item.type]} tone="muted" />
                  </View>
                </View>
              </Card>
            );
          }}
        />
      )}

      <NewAppointmentModal
        visible={dialogOpen}
        onClose={() => setDialogOpen(false)}
        saving={saving}
        setSaving={setSaving}
        userId={user?.id}
        role={role}
        defaultDate={selectedDay}
        onCreated={async () => {
          setDialogOpen(false);
          await load();
        }}
      />
    </View>
  );
}

function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function NewAppointmentModal({
  visible,
  onClose,
  saving,
  setSaving,
  userId,
  role,
  defaultDate,
  onCreated,
}: {
  visible: boolean;
  onClose: () => void;
  saving: boolean;
  setSaving: (v: boolean) => void;
  userId?: string;
  role: string | null;
  defaultDate: Date;
  onCreated: () => void | Promise<void>;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [type, setType] = useState<AppointmentType>("domiciliar");
  const [date, setDate] = useState(defaultDate.toISOString().slice(0, 10));
  const [time, setTime] = useState("09:00");
  const [duration, setDuration] = useState("30");

  useEffect(() => {
    if (visible) setDate(defaultDate.toISOString().slice(0, 10));
  }, [visible, defaultDate]);

  const submit = async () => {
    if (!userId || !title.trim()) {
      Alert.alert("Campo obrigatório", "Informe o título do atendimento.");
      return;
    }
    setSaving(true);
    const scheduledAt = new Date(`${date}T${time}:00`).toISOString();
    const isProfessional = role === "profissional";
    const payload = {
      title: title.trim(),
      description: description.trim() || null,
      address: address.trim() || null,
      type,
      status: "agendado" as const,
      scheduled_at: scheduledAt,
      duration_minutes: parseInt(duration, 10) || 30,
      patient_id: userId,
      professional_id: isProfessional ? userId : null,
    };
    const { error } = await supabase.from("appointments").insert(payload);
    setSaving(false);
    if (error) {
      Alert.alert("Erro ao salvar", error.message);
      return;
    }
    setTitle("");
    setDescription("");
    setAddress("");
    await onCreated();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <View style={styles.modalSheet}>
          <ScrollView keyboardShouldPersistTaps="handled">
            <Text style={styles.modalTitle}>Novo atendimento</Text>

            <FormField label="Título">
              <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="Ex: Curativo pós-op" placeholderTextColor={colors.textMuted} />
            </FormField>

            <FormField label="Descrição">
              <TextInput
                style={[styles.input, { height: 70, textAlignVertical: "top" }]}
                value={description}
                onChangeText={setDescription}
                multiline
                placeholderTextColor={colors.textMuted}
              />
            </FormField>

            <View style={{ flexDirection: "row", gap: 10 }}>
              <FormField label="Data" style={{ flex: 1 }}>
                <TextInput style={styles.input} value={date} onChangeText={setDate} placeholder="AAAA-MM-DD" placeholderTextColor={colors.textMuted} />
              </FormField>
              <FormField label="Hora" style={{ flex: 1 }}>
                <TextInput style={styles.input} value={time} onChangeText={setTime} placeholder="HH:MM" placeholderTextColor={colors.textMuted} />
              </FormField>
            </View>

            <FormField label="Tipo">
              <View style={{ flexDirection: "row", gap: 8 }}>
                {(Object.keys(TYPE_LABEL) as AppointmentType[]).map((t) => (
                  <Pressable
                    key={t}
                    onPress={() => setType(t)}
                    style={[styles.typeChip, type === t && styles.typeChipActive]}
                  >
                    <Text style={[styles.typeChipText, type === t && styles.typeChipTextActive]}>{TYPE_LABEL[t]}</Text>
                  </Pressable>
                ))}
              </View>
            </FormField>

            <FormField label="Duração (min)">
              <TextInput
                style={styles.input}
                value={duration}
                onChangeText={setDuration}
                keyboardType="numeric"
                placeholderTextColor={colors.textMuted}
              />
            </FormField>

            {type !== "teleconsulta" && (
              <FormField label="Endereço">
                <TextInput
                  style={styles.input}
                  value={address}
                  onChangeText={setAddress}
                  placeholder="Rua, número, bairro"
                  placeholderTextColor={colors.textMuted}
                />
              </FormField>
            )}

            <View style={{ flexDirection: "row", gap: 10, marginTop: 18 }}>
              <View style={{ flex: 1 }}>
                <AppButton label="Cancelar" variant="outline" onPress={onClose} disabled={saving} />
              </View>
              <View style={{ flex: 1 }}>
                <AppButton label={saving ? "Salvando..." : "Agendar"} onPress={submit} disabled={saving} />
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function FormField({ label, children, style }: { label: string; children: React.ReactNode; style?: object }) {
  return (
    <View style={[{ marginTop: 12 }, style]}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.card },
  headerBtn: { paddingHorizontal: 12, paddingVertical: 6, backgroundColor: colors.primary, borderRadius: 8 },
  headerBtnText: { color: colors.textInverse, fontWeight: "700", fontSize: 13 },
  dayStrip: { flexGrow: 0, paddingVertical: 12 },
  dayChip: {
    minWidth: 56,
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  dayChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  dayChipWeekday: { fontSize: 10, textTransform: "uppercase", color: colors.textMuted, fontWeight: "700" },
  dayChipDate: { fontSize: 16, fontWeight: "800", color: colors.text, marginTop: 2 },
  dayChipTextActive: { color: colors.textInverse },
  dayChipBadge: {
    position: "absolute",
    top: -6,
    right: -6,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 3,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  dayChipBadgeActive: { backgroundColor: colors.card },
  dayChipBadgeText: { fontSize: 10, fontWeight: "800", color: colors.textInverse },
  empty: {
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: colors.border,
    borderRadius: 16,
    padding: 28,
    alignItems: "center",
  },
  emptyText: { color: colors.textMuted, fontSize: 13.5 },
  time: { fontSize: 14, fontWeight: "800", color: colors.text },
  duration: { fontSize: 10.5, color: colors.textMuted, marginTop: 1 },
  evTitle: { fontSize: 14.5, fontWeight: "700", color: colors.text },
  evSub: { fontSize: 12.5, color: colors.textMuted, marginTop: 2 },
  modalBackdrop: { flex: 1, backgroundColor: "#00000066", justifyContent: "flex-end" },
  modalSheet: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: "88%",
    paddingBottom: Platform.OS === "ios" ? 34 : 20,
  },
  modalTitle: { fontSize: 18, fontWeight: "800", color: colors.text },
  fieldLabel: { fontSize: 12, fontWeight: "700", color: colors.textMuted, marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.text,
  },
  typeChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  typeChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  typeChipText: { fontSize: 12.5, color: colors.text, fontWeight: "600" },
  typeChipTextActive: { color: colors.textInverse },
});
