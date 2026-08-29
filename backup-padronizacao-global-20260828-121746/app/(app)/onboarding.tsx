// Onboarding — completa o cadastro do profissional/cliente logado,
// gravando direto em "profiles" (mesmos campos usados pela busca de
// profissionais: categoria, cidade, raio de atendimento etc.).
import { useState } from "react";
import { Alert, ScrollView, StyleSheet, Text } from "react-native";
import { useRouter } from "expo-router";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/auth-context";
import { colors } from "@/theme/colors";
import { AppButton, ChipSelect, FormField, TextField } from "@/components/ui/Kit";

const CATEGORIES: string[] = [
  "enfermeiro", "tecnico_enfermagem", "medico", "psicologo", "fisioterapeuta",
  "fonoaudiologo", "nutricionista", "terapeuta_ocupacional", "cuidador", "auxiliar_enfermagem",
];

type Category =
  | "enfermeiro"
  | "tecnico_enfermagem"
  | "medico"
  | "psicologo"
  | "fisioterapeuta"
  | "fonoaudiologo"
  | "nutricionista"
  | "terapeuta_ocupacional"
  | "cuidador"
  | "auxiliar_enfermagem";

export default function OnboardingScreen() {
  const { user, role } = useAuth();
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [city, setCity] = useState("");
  const [category, setCategory] = useState<Category | "">("");
  const [bio, setBio] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleFinish() {
    if (!user) return;
    setSaving(true);
    const payload: {
      full_name: string | null;
      city: string | null;
      bio: string | null;
      onboarding_completed: boolean;
      category?: Category;
    } = {
      full_name: fullName || null,
      city: city || null,
      bio: bio || null,
      onboarding_completed: true,
    };

    if (role === "profissional" && category) {
      payload.category = category;
    }
    const { error } = await supabase.from("profiles").update(payload).eq("id", user.id);
    setSaving(false);
    if (error) {
      Alert.alert("Erro", error.message);
      return;
    }
    router.replace("/inicio");
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16, paddingBottom: 48 }}>
      <Text style={styles.title}>Complete seu cadastro</Text>
      <Text style={styles.subtitle}>Só mais alguns dados para começar a usar o ZELAR+.</Text>

      <FormField label="Nome completo" required>
        <TextField value={fullName} onChangeText={setFullName} />
      </FormField>
      <FormField label="Cidade">
        <TextField value={city} onChangeText={setCity} />
      </FormField>
      {role === "profissional" && (
        <FormField label="Categoria profissional">
          <ChipSelect value={category} options={CATEGORIES} onChange={(value) => setCategory(value as Category)} />
        </FormField>
      )}
      <FormField label="Bio">
        <TextField value={bio} onChangeText={setBio} multiline />
      </FormField>

      <AppButton label={saving ? "Salvando..." : "Concluir"} onPress={handleFinish} disabled={saving || !fullName.trim()} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.card },
  title: { fontSize: 20, fontWeight: "800", color: colors.text },
  subtitle: { fontSize: 13.5, color: colors.textMuted, marginTop: 4, marginBottom: 16 },
});
