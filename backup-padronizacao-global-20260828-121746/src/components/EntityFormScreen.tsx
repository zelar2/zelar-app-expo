// Tela de formulário completa (não-modal), usada pelas rotas dedicadas
// "*-novo" (ex: colaboradores-novo, contratos-novo). Grava um registro real
// na tabela Supabase informada e volta para a listagem ao concluir.
import { useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";

import { useAuth } from "@/context/auth-context";
import { colors } from "@/theme/colors";
import { AppButton, ChipSelect, FormField, SwitchField, TextField } from "@/components/ui/Kit";
import type { FieldDef } from "@/components/CrudScreen";

import { fromTable } from "@/integrations/supabase/typed";
export interface EntityFormScreenProps {
  title: string;
  table: string;
  fields: FieldDef[];
  /** Rota de listagem para invalidar/voltar após salvar (ex: "/colaboradores"). */
  backRoute: string;
}

function emptyValues(fields: FieldDef[]): Record<string, unknown> {
  const v: Record<string, unknown> = {};
  for (const f of fields) v[f.key] = f.type === "boolean" ? false : "";
  return v;
}

export function EntityFormScreen({ title, table, fields, backRoute }: EntityFormScreenProps) {
  const [values, setValues] = useState<Record<string, unknown>>(emptyValues(fields));
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const qc = useQueryClient();
  const { user } = useAuth();

  async function handleSave() {
    const missing = fields.filter((f) => f.required && !f.autoUser && !String(values[f.key] ?? "").trim());
    if (missing.length > 0) {
      Alert.alert("Campos obrigatórios", `Preencha: ${missing.map((f) => f.label).join(", ")}`);
      return;
    }
    setSaving(true);
    try {
      const payload: Record<string, unknown> = {};
      for (const f of fields) {
        payload[f.key] = f.autoUser ? (user?.id ?? null) : values[f.key] === "" ? null : values[f.key];
      }
      const { error } = await fromTable(table).insert(payload);
      if (error) throw error;
      await qc.invalidateQueries({ queryKey: ["crud", table] });
      await qc.invalidateQueries({ queryKey: ["generic-screen", table] });
      Alert.alert("Salvo", "Registro criado com sucesso.", [
        { text: "OK", onPress: () => router.replace(backRoute as never) },
      ]);
    } catch (e) {
      Alert.alert("Erro ao salvar", (e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16, paddingBottom: 48 }}>
      <Text style={styles.title}>{title}</Text>
      <View style={{ marginTop: 16 }}>
        {fields.filter((f) => !f.autoUser).map((f) => (
          <FormField key={f.key} label={f.label} required={f.required}>
            {f.type === "boolean" ? (
              <SwitchField value={Boolean(values[f.key])} onValueChange={(v) => setValues((s) => ({ ...s, [f.key]: v }))} />
            ) : f.type === "select" && f.options ? (
              <ChipSelect value={String(values[f.key] ?? "")} options={f.options} onChange={(v) => setValues((s) => ({ ...s, [f.key]: v }))} />
            ) : (
              <TextField
                value={values[f.key] === null || values[f.key] === undefined ? "" : String(values[f.key])}
                onChangeText={(v) => setValues((s) => ({ ...s, [f.key]: v }))}
                multiline={f.type === "textarea"}
                keyboardType={f.type === "number" ? "numeric" : "default"}
                placeholder={f.type === "date" ? "AAAA-MM-DD" : undefined}
              />
            )}
          </FormField>
        ))}
      </View>
      <AppButton label={saving ? "Salvando..." : "Salvar"} onPress={handleSave} disabled={saving} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.card },
  title: { fontSize: 20, fontWeight: "800", color: colors.text },
});
