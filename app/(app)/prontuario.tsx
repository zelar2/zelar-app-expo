import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/auth-context";
import { AppButton, Badge, TextField } from "@/components/ui/Kit";

type Category =
  | "perfil_clinico"
  | "medicamento"
  | "vacina"
  | "sinais_vitais"
  | "exame"
  | "evolucao";

type HealthRecord = {
  id: string;
  patient_id: string;
  author_id: string | null;
  category: Category;
  title: string;
  content: string | null;
  created_at: string;
};

type CategoryDefinition = {
  key: Category;
  title: string;
  desc: string;
  icon: keyof typeof Ionicons.glyphMap;
};

const CATEGORIES: CategoryDefinition[] = [
  {
    key: "perfil_clinico",
    title: "Perfil clínico",
    desc: "Alergias, doenças, cirurgias",
    icon: "heart-outline",
  },
  {
    key: "medicamento",
    title: "Medicamentos em uso",
    desc: "Doses, horários e adesão",
    icon: "medical-outline",
  },
  {
    key: "vacina",
    title: "Vacinas",
    desc: "Carteira digital",
    icon: "bandage-outline",
  },
  {
    key: "sinais_vitais",
    title: "Sinais vitais",
    desc: "Histórico e tendência",
    icon: "pulse-outline",
  },
  {
    key: "exame",
    title: "Exames e laudos",
    desc: "PDF, imagens e resultados",
    icon: "document-text-outline",
  },
  {
    key: "evolucao",
    title: "Evoluções e atendimentos",
    desc: "Linha do tempo completa",
    icon: "time-outline",
  },
];

function formatDate(value: string) {
  try {
    return new Date(value).toLocaleString("pt-BR");
  } catch {
    return value;
  }
}

function categoryDefinition(category: Category) {
  return CATEGORIES.find((item) => item.key === category)!;
}

export default function ProntuarioScreen() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [selected, setSelected] = useState<Category | null>(null);
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const userId = user?.id;

  const load = useCallback(async () => {
    if (!userId) {
      setRecords([]);
      return;
    }

    setLoading(true);

    const { data, error } = await supabase
      .from("health_records")
      .select("*")
      .eq("patient_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      Alert.alert("Erro", `Erro ao carregar prontuário: ${error.message}`);
      setRecords([]);
    } else {
      setRecords((data as HealthRecord[] | null) ?? []);
    }

    setLoading(false);
  }, [userId]);

  useEffect(() => {
    if (!authLoading) {
      void load();
    }
  }, [authLoading, load]);

  const countsByCategory = useMemo(() => {
    const counts = new Map<Category, number>();

    for (const record of records) {
      counts.set(record.category, (counts.get(record.category) ?? 0) + 1);
    }

    return counts;
  }, [records]);

  const selectedRecords = useMemo(() => {
    if (!selected) return [];
    return records.filter((record) => record.category === selected);
  }, [records, selected]);

  const openNewRecord = () => {
    setTitle("");
    setContent("");
    setDialogOpen(true);
  };

  const closeNewRecord = () => {
    if (saving) return;
    setDialogOpen(false);
    setTitle("");
    setContent("");
  };

  const saveRecord = async () => {
    if (!userId || !selected) {
      Alert.alert("Erro", "Não foi possível identificar o paciente.");
      return;
    }

    if (!title.trim()) {
      Alert.alert("Atenção", "Informe o título.");
      return;
    }

    setSaving(true);

    const { error } = await supabase.from("health_records").insert({
      patient_id: userId,
      author_id: userId,
      category: selected,
      title: title.trim(),
      content: content.trim() || null,
    });

    setSaving(false);

    if (error) {
      Alert.alert("Erro", error.message);
      return;
    }

    closeNewRecord();
    await load();
  };

  const deleteRecord = (record: HealthRecord) => {
    Alert.alert(
      "Remover registro",
      `Deseja remover "${record.title}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Remover",
          style: "destructive",
          onPress: async () => {
            const { error } = await supabase
              .from("health_records")
              .delete()
              .eq("id", record.id);

            if (error) {
              Alert.alert("Erro", error.message);
              return;
            }

            await load();
          },
        },
      ],
    );
  };

  if (authLoading || loading && !selected) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Carregando prontuário...</Text>
      </View>
    );
  }

  if (!userId) {
    return (
      <View style={styles.center}>
        <Ionicons name="person-outline" size={42} />
        <Text style={styles.emptyTitle}>Usuário não identificado</Text>
        <Text style={styles.emptyText}>
          Faça login novamente para acessar o prontuário.
        </Text>
      </View>
    );
  }

  if (selected) {
    const category = categoryDefinition(selected);

    return (
      <View style={styles.screen}>
        <View style={styles.header}>
          <Pressable
            onPress={() => setSelected(null)}
            style={styles.iconButton}
            accessibilityLabel="Voltar"
          >
            <Ionicons name="arrow-back" size={22} />
          </Pressable>

          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>{category.title}</Text>
            <Text style={styles.headerSubtitle}>{category.desc}</Text>
          </View>

          <Pressable
            onPress={openNewRecord}
            style={styles.addHeaderButton}
            accessibilityLabel="Novo registro"
          >
            <Ionicons name="add" size={22} color="#FFFFFF" />
          </Pressable>
        </View>

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" />
          </View>
        ) : selectedRecords.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name={category.icon} size={38} />
            <Text style={styles.emptyTitle}>Nenhum registro ainda.</Text>
            <Text style={styles.emptyText}>
              Adicione o primeiro registro desta categoria.
            </Text>

            <AppButton
              label="Adicionar"
              onPress={openNewRecord}
            />
          </View>
        ) : (
          <FlatList
            data={selectedRecords}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => (
              <View style={styles.recordCard}>
                <View style={styles.recordTop}>
                  <View style={styles.recordMain}>
                    <Text style={styles.recordTitle}>{item.title}</Text>

                    {item.content ? (
                      <Text style={styles.recordContent}>
                        {item.content}
                      </Text>
                    ) : null}

                    <Text style={styles.recordDate}>
                      {formatDate(item.created_at)}
                    </Text>
                  </View>

                  {item.author_id === userId ? (
                    <Pressable
                      onPress={() => deleteRecord(item)}
                      style={styles.deleteButton}
                      accessibilityLabel="Excluir registro"
                    >
                      <Ionicons
                        name="trash-outline"
                        size={19}
                      />
                    </Pressable>
                  ) : null}
                </View>
              </View>
            )}
          />
        )}

        {dialogOpen ? (
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Novo registro</Text>

                <Pressable
                  onPress={closeNewRecord}
                  disabled={saving}
                  style={styles.iconButton}
                >
                  <Ionicons name="close" size={22} />
                </Pressable>
              </View>

              <ScrollView
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={styles.modalContent}
              >
                <TextField
                  value={title}
                  onChangeText={setTitle}
                  placeholder="Ex: PA 120x80"
                />

                <TextField
                  value={content}
                  onChangeText={setContent}
                  placeholder="Informe os detalhes do registro"
                  multiline
                />

                <View style={styles.modalActions}>
                  <AppButton
                    label="Cancelar"
                    variant="outline"
                    onPress={closeNewRecord}
                    disabled={saving}
                  />

                  <AppButton
                    label={saving ? "Salvando..." : "Salvar"}
                    onPress={saveRecord}
                    disabled={saving}
                  />
                </View>
              </ScrollView>
            </View>
          </View>
        ) : null}
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={styles.iconButton}
          accessibilityLabel="Voltar"
        >
          <Ionicons name="arrow-back" size={22} />
        </Pressable>

        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>Prontuário</Text>
          <Text style={styles.headerSubtitle}>Histórico de saúde</Text>
        </View>
      </View>

      <FlatList
        data={CATEGORIES}
        keyExtractor={(item) => item.key}
        contentContainerStyle={styles.categoryList}
        renderItem={({ item }) => {
          const count = countsByCategory.get(item.key) ?? 0;

          return (
            <Pressable
              onPress={() => setSelected(item.key)}
              style={({ pressed }) => [
                styles.categoryCard,
                pressed && styles.pressed,
              ]}
            >
              <View style={styles.categoryIcon}>
                <Ionicons name={item.icon} size={23} />
              </View>

              <View style={styles.categoryText}>
                <Text style={styles.categoryTitle}>{item.title}</Text>
                <Text style={styles.categoryDesc}>{item.desc}</Text>
              </View>

              <Badge label={String(count)} tone="primary" />

              <Ionicons
                name="chevron-forward"
                size={19}
              />
            </Pressable>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  fieldLabel: {
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 6,
  },
  screen: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#F5F7FA",
  },

  loadingText: {
    marginTop: 10,
    fontSize: 14,
  },

  header: {
    minHeight: 78,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#D9DEE7",
  },

  headerText: {
    flex: 1,
    minWidth: 0,
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
  },

  headerSubtitle: {
    marginTop: 2,
    fontSize: 13,
    opacity: 0.65,
  },

  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  addHeaderButton: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2F80ED",
  },

  categoryList: {
    padding: 16,
    gap: 10,
  },

  categoryCard: {
    minHeight: 82,
    borderRadius: 18,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E1E5EC",
  },

  categoryIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EAF3FF",
  },

  categoryText: {
    flex: 1,
  },

  categoryTitle: {
    fontSize: 15,
    fontWeight: "700",
  },

  categoryDesc: {
    marginTop: 3,
    fontSize: 12,
    opacity: 0.62,
  },

  pressed: {
    opacity: 0.75,
  },

  listContent: {
    padding: 16,
    gap: 10,
  },

  recordCard: {
    borderRadius: 18,
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E1E5EC",
  },

  recordTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },

  recordMain: {
    flex: 1,
  },

  recordTitle: {
    fontSize: 15,
    fontWeight: "700",
  },

  recordContent: {
    marginTop: 7,
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.72,
  },

  recordDate: {
    marginTop: 10,
    fontSize: 10,
    opacity: 0.55,
  },

  deleteButton: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },

  emptyCard: {
    margin: 16,
    padding: 28,
    borderRadius: 20,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#CBD3DF",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
  },

  emptyTitle: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: "700",
  },

  emptyText: {
    marginTop: 6,
    marginBottom: 18,
    fontSize: 13,
    lineHeight: 19,
    textAlign: "center",
    opacity: 0.65,
  },

  modalOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.42)",
    justifyContent: "flex-end",
  },

  modalCard: {
    maxHeight: "88%",
    padding: 18,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: "#FFFFFF",
  },

  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },

  modalTitle: {
    fontSize: 19,
    fontWeight: "800",
  },

  modalContent: {
    paddingTop: 8,
    paddingBottom: 20,
    gap: 14,
  },

  modalActions: {
    marginTop: 4,
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
  },
});
