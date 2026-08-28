// Minha conta — edição real do próprio registro em "profiles" (nome,
// telefone, cidade, bio etc.), gravando direto no Supabase.
import { useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text } from "react-native";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/auth-context";
import { colors } from "@/theme/colors";
import { AppButton, FormField, LoadingState, TextField } from "@/components/ui/Kit";

export default function MinhaContaScreen() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [form, setForm] = useState({ full_name: "", phone: "", city: "", state: "", bio: "" });
  const [saving, setSaving] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["minha-conta", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*").eq("id", user!.id).maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  useEffect(() => {
    if (data) {
      setForm({
        full_name: data.full_name ?? "",
        phone: data.phone ?? "",
        city: data.city ?? "",
        state: data.state ?? "",
        bio: data.bio ?? "",
      });
    }
  }, [data]);

  async function handleSave() {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update(form).eq("id", user.id);
    setSaving(false);
    if (error) {
      Alert.alert("Erro ao salvar", error.message);
      return;
    }
    qc.invalidateQueries({ queryKey: ["minha-conta", user.id] });
    Alert.alert("Salvo", "Seus dados foram atualizados.");
  }

  if (isLoading) return <LoadingState />;

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16, paddingBottom: 48 }}>
      <Text style={styles.title}>Minha conta</Text>
      <FormField label="Nome completo">
        <TextField value={form.full_name} onChangeText={(v) => setForm((s) => ({ ...s, full_name: v }))} />
      </FormField>
      <FormField label="Telefone">
        <TextField value={form.phone} onChangeText={(v) => setForm((s) => ({ ...s, phone: v }))} keyboardType="phone-pad" />
      </FormField>
      <FormField label="Cidade">
        <TextField value={form.city} onChangeText={(v) => setForm((s) => ({ ...s, city: v }))} />
      </FormField>
      <FormField label="Estado">
        <TextField value={form.state} onChangeText={(v) => setForm((s) => ({ ...s, state: v }))} />
      </FormField>
      <FormField label="Bio">
        <TextField value={form.bio} onChangeText={(v) => setForm((s) => ({ ...s, bio: v }))} multiline />
      </FormField>
      <AppButton label={saving ? "Salvando..." : "Salvar alterações"} onPress={handleSave} disabled={saving} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.card },
  title: { fontSize: 20, fontWeight: "800", color: colors.text, marginBottom: 16 },
});
