// Porta de src/routes/auth.tsx. Mesma lógica de login/cadastro com Supabase
// (mesmas validações com zod), trocando <form>/<Input> HTML por componentes
// nativos (TextInput, Pressable) e window.location por Linking/expo-web-browser
// para o fluxo OAuth do Google.
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Redirect, useLocalSearchParams } from "expo-router";
import * as Linking from "expo-linking";
import { z } from "zod";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/auth-context";
import { colors } from "@/theme/colors";

const emailSchema = z.string().trim().email("E-mail inválido").max(255);
const passwordSchema = z.string().min(8, "Mínimo 8 caracteres").max(72);
const nameSchema = z.string().trim().min(2, "Informe seu nome completo").max(100);

export default function AuthScreen() {
  const { session } = useAuth();
  const params = useLocalSearchParams<{ mode?: "login" | "signup" }>();

  const [mode, setMode] = useState<"login" | "signup">(params.mode ?? "login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [busy, setBusy] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);

  useEffect(() => {
    if (params.mode && params.mode !== mode) setMode(params.mode);
  }, [params.mode]);

  if (session) {
    return <Redirect href="/inicio" />;
  }

  async function handleGoogle() {
    if (busy) return;
    setBusy(true);
    setErrorMsg(null);
    try {
      const redirectTo = Linking.createURL("auth-callback");
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo, skipBrowserRedirect: true },
      });
      if (error) throw error;
      if (data?.url) {
        await Linking.openURL(data.url);
      }
    } catch (error) {
      setErrorMsg(error instanceof Error ? error.message : "Não foi possível entrar com Google.");
    } finally {
      setBusy(false);
    }
  }

  async function handleSubmit() {
    if (busy) return;
    setBusy(true);
    setErrorMsg(null);
    setInfoMsg(null);

    try {
      const emailOk = emailSchema.safeParse(email);
      const passOk = passwordSchema.safeParse(password);

      if (!emailOk.success) throw new Error(emailOk.error.issues[0]?.message ?? "E-mail inválido.");
      if (!passOk.success) throw new Error(passOk.error.issues[0]?.message ?? "Senha inválida.");

      if (mode === "signup") {
        const nameOk = nameSchema.safeParse(fullName);
        if (!nameOk.success) {
          throw new Error(nameOk.error.issues[0]?.message ?? "Informe seu nome completo.");
        }

        const redirectTo = Linking.createURL("auth-callback");
        const { data, error } = await supabase.auth.signUp({
          email: emailOk.data,
          password: passOk.data,
          options: {
            data: { full_name: nameOk.data },
            emailRedirectTo: redirectTo,
          },
        });

        if (error) throw error;

        if (!data.session) {
          setInfoMsg("Conta criada! Verifique seu e-mail para confirmar o cadastro.");
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: emailOk.data,
          password: passOk.data,
        });
        if (error) throw error;
      }
    } catch (error) {
      setErrorMsg(error instanceof Error ? error.message : "Erro desconhecido.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.brand}>ZELAR+</Text>
        <Text style={styles.subtitle}>
          {mode === "login" ? "Entre na sua conta" : "Crie sua conta grátis"}
        </Text>

        <View style={styles.tabs}>
          <Pressable
            style={[styles.tab, mode === "login" && styles.tabActive]}
            onPress={() => setMode("login")}
          >
            <Text style={[styles.tabText, mode === "login" && styles.tabTextActive]}>Entrar</Text>
          </Pressable>
          <Pressable
            style={[styles.tab, mode === "signup" && styles.tabActive]}
            onPress={() => setMode("signup")}
          >
            <Text style={[styles.tabText, mode === "signup" && styles.tabTextActive]}>
              Criar conta
            </Text>
          </Pressable>
        </View>

        {mode === "signup" && (
          <View style={styles.field}>
            <Text style={styles.label}>Nome completo</Text>
            <TextInput
              style={styles.input}
              value={fullName}
              onChangeText={setFullName}
              placeholder="Seu nome"
              placeholderTextColor={colors.textMuted}
              autoCapitalize="words"
            />
          </View>
        )}

        <View style={styles.field}>
          <Text style={styles.label}>E-mail</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="voce@email.com"
            placeholderTextColor={colors.textMuted}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Senha</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            placeholderTextColor={colors.textMuted}
            secureTextEntry
          />
        </View>

        {errorMsg && <Text style={styles.error}>{errorMsg}</Text>}
        {infoMsg && <Text style={styles.info}>{infoMsg}</Text>}

        <Pressable style={styles.submit} onPress={handleSubmit} disabled={busy}>
          {busy ? (
            <ActivityIndicator color={colors.textInverse} />
          ) : (
            <Text style={styles.submitText}>{mode === "login" ? "Entrar" : "Criar conta"}</Text>
          )}
        </Pressable>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>ou</Text>
          <View style={styles.dividerLine} />
        </View>

        <Pressable style={styles.google} onPress={handleGoogle} disabled={busy}>
          <Text style={styles.googleText}>Continuar com Google</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  container: { flexGrow: 1, padding: 24, justifyContent: "center" },
  brand: { color: colors.primary, fontSize: 32, fontWeight: "800", textAlign: "center" },
  subtitle: { color: colors.textInverse, fontSize: 15, textAlign: "center", marginTop: 6, marginBottom: 24 },
  tabs: {
    flexDirection: "row",
    backgroundColor: colors.surfaceAlt,
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  tab: { flex: 1, paddingVertical: 10, borderRadius: 9, alignItems: "center" },
  tabActive: { backgroundColor: colors.primary },
  tabText: { color: colors.textMuted, fontWeight: "600" },
  tabTextActive: { color: colors.textInverse },
  field: { marginBottom: 14 },
  label: { color: colors.textInverse, marginBottom: 6, fontSize: 13, fontWeight: "600" },
  input: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: colors.textInverse,
    fontSize: 15,
  },
  error: { color: colors.danger, marginTop: 4, marginBottom: 8, fontSize: 13 },
  info: { color: colors.success, marginTop: 4, marginBottom: 8, fontSize: 13 },
  submit: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
  },
  submitText: { color: colors.textInverse, fontWeight: "700", fontSize: 16 },
  divider: { flexDirection: "row", alignItems: "center", marginVertical: 20 },
  dividerLine: { flex: 1, height: 1, backgroundColor: colors.surfaceAlt },
  dividerText: { color: colors.textMuted, marginHorizontal: 10, fontSize: 12 },
  google: {
    borderWidth: 1,
    borderColor: colors.surfaceAlt,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  googleText: { color: colors.textInverse, fontWeight: "600", fontSize: 15 },
});
