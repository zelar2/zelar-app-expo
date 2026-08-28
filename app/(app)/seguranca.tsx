// Segurança — troca de senha real via supabase.auth.updateUser.
import { useState } from "react";
import { Alert, ScrollView, StyleSheet, Text } from "react-native";

import { supabase } from "@/integrations/supabase/client";
import { colors } from "@/theme/colors";
import { AppButton, FormField, TextField } from "@/components/ui/Kit";

export default function SegurancaScreen() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleChangePassword() {
    if (password.length < 6) {
      Alert.alert("Senha muito curta", "Use ao menos 6 caracteres.");
      return;
    }
    if (password !== confirm) {
      Alert.alert("As senhas não coincidem", "Confirme a mesma senha nos dois campos.");
      return;
    }
    setSaving(true);
    const { error } = await supabase.auth.updateUser({ password });
    setSaving(false);
    if (error) {
      Alert.alert("Erro ao trocar senha", error.message);
      return;
    }
    setPassword("");
    setConfirm("");
    Alert.alert("Senha atualizada", "Sua senha foi alterada com sucesso.");
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16, paddingBottom: 48 }}>
      <Text style={styles.title}>Segurança</Text>
      <Text style={styles.subtitle}>Altere a senha da sua conta ZELAR+.</Text>

      <FormField label="Nova senha" required>
        <TextField value={password} onChangeText={setPassword} placeholder="Mínimo 6 caracteres" />
      </FormField>
      <FormField label="Confirmar nova senha" required>
        <TextField value={confirm} onChangeText={setConfirm} />
      </FormField>

      <AppButton label={saving ? "Salvando..." : "Alterar senha"} onPress={handleChangePassword} disabled={saving} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.card },
  title: { fontSize: 20, fontWeight: "800", color: colors.text },
  subtitle: { fontSize: 13.5, color: colors.textMuted, marginTop: 4, marginBottom: 16 },
});
