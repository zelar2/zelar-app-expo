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
    if (params.mode && params.mode !== mode) {
      setMode(params.mode);
    }
  }, [params.mode]);

  if (session) {
    return <Redirect href="/inicio" />;
  }

  async function handleGoogle() {
    if (busy) return;

    setBusy(true);
    setErrorMsg(null);
    setInfoMsg(null);

    try {
      const redirectTo = Linking.createURL("auth-callback");

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo,
          skipBrowserRedirect: true,
        },
      });

      if (error) throw error;

      if (data?.url) {
        await Linking.openURL(data.url);
      }
    } catch (error) {
      setErrorMsg(
        error instanceof Error
          ? error.message
          : "Não foi possível entrar com Google."
      );
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

      if (!emailOk.success) {
        throw new Error(
          emailOk.error.issues[0]?.message ?? "E-mail inválido."
        );
      }

      if (!passOk.success) {
        throw new Error(
          passOk.error.issues[0]?.message ?? "Senha inválida."
        );
      }

      if (mode === "signup") {
        const nameOk = nameSchema.safeParse(fullName);

        if (!nameOk.success) {
          throw new Error(
            nameOk.error.issues[0]?.message ??
              "Informe seu nome completo."
          );
        }

        const redirectTo = Linking.createURL("auth-callback");

        const { data, error } = await supabase.auth.signUp({
          email: emailOk.data,
          password: passOk.data,
          options: {
            data: {
              full_name: nameOk.data,
            },
            emailRedirectTo: redirectTo,
          },
        });

        if (error) throw error;

        if (!data.session) {
          setInfoMsg(
            "Conta criada! Verifique seu e-mail para confirmar o cadastro."
          );
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: emailOk.data,
          password: passOk.data,
        });

        if (error) throw error;
      }
    } catch (error) {
      setErrorMsg(
        error instanceof Error ? error.message : "Erro desconhecido."
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.logoMark}>
            <Text style={styles.logoMarkText}>+</Text>
          </View>

          <Text style={styles.brand}>ZELAR+</Text>

          <Text style={styles.subtitle}>
            {mode === "login"
              ? "Entre na sua conta"
              : "Crie sua conta gratuitamente"}
          </Text>
        </View>

        <View style={styles.card}>
          <View style={styles.tabs}>
            <Pressable
              style={[
                styles.tab,
                mode === "login" && styles.tabActive,
              ]}
              onPress={() => {
                setMode("login");
                setErrorMsg(null);
                setInfoMsg(null);
              }}
            >
              <Text
                style={[
                  styles.tabText,
                  mode === "login" && styles.tabTextActive,
                ]}
              >
                Entrar
              </Text>
            </Pressable>

            <Pressable
              style={[
                styles.tab,
                mode === "signup" && styles.tabActive,
              ]}
              onPress={() => {
                setMode("signup");
                setErrorMsg(null);
                setInfoMsg(null);
              }}
            >
              <Text
                style={[
                  styles.tabText,
                  mode === "signup" && styles.tabTextActive,
                ]}
              >
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
                placeholder="Digite seu nome"
                placeholderTextColor={colors.textMuted}
                autoCapitalize="words"
                autoCorrect={false}
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
              autoCorrect={false}
              keyboardType="email-address"
              textContentType="emailAddress"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Senha</Text>

            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="Digite sua senha"
              placeholderTextColor={colors.textMuted}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              textContentType="password"
            />
          </View>

          {errorMsg && (
            <View style={styles.messageError}>
              <Text style={styles.messageErrorText}>{errorMsg}</Text>
            </View>
          )}

          {infoMsg && (
            <View style={styles.messageInfo}>
              <Text style={styles.messageInfoText}>{infoMsg}</Text>
            </View>
          )}

          <Pressable
            style={({ pressed }) => [
              styles.submit,
              pressed && styles.submitPressed,
              busy && styles.submitDisabled,
            ]}
            onPress={handleSubmit}
            disabled={busy}
          >
            {busy ? (
              <ActivityIndicator color={colors.textInverse} />
            ) : (
              <Text style={styles.submitText}>
                {mode === "login" ? "Entrar" : "Criar minha conta"}
              </Text>
            )}
          </Pressable>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>ou</Text>
            <View style={styles.dividerLine} />
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.google,
              pressed && styles.googlePressed,
              busy && styles.googleDisabled,
            ]}
            onPress={handleGoogle}
            disabled={busy}
          >
            <View style={styles.googleIcon}>
              <Text style={styles.googleIconText}>G</Text>
            </View>

            <Text style={styles.googleText}>
              Continuar com Google
            </Text>
          </Pressable>
        </View>

        <Text style={styles.footer}>
          ZELAR+ • Cuidado, tecnologia e confiança
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },

  scroll: {
    flexGrow: 1,
    paddingHorizontal: 22,
    paddingTop: 54,
    paddingBottom: 28,
    justifyContent: "center",
  },

  header: {
    alignItems: "center",
    marginBottom: 24,
  },

  logoMark: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },

  logoMarkText: {
    color: colors.textInverse,
    fontSize: 28,
    fontWeight: "800",
    lineHeight: 32,
  },

  brand: {
    color: colors.primary,
    fontSize: 34,
    fontWeight: "800",
    letterSpacing: 0.5,
  },

  subtitle: {
    color: colors.textSecondary,
    fontSize: 15,
    marginTop: 7,
    textAlign: "center",
  },

  card: {
    width: "100%",
    backgroundColor: colors.card,
    borderRadius: 22,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: "#000000",
    shadowOpacity: 0.06,
    shadowRadius: 14,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    elevation: 3,
  },

  tabs: {
    flexDirection: "row",
    backgroundColor: colors.surfaceAlt,
    borderRadius: 13,
    padding: 4,
    marginBottom: 22,
  },

  tab: {
    flex: 1,
    minHeight: 44,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },

  tabActive: {
    backgroundColor: colors.primary,
  },

  tabText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: "700",
  },

  tabTextActive: {
    color: colors.textInverse,
  },

  field: {
    marginBottom: 16,
  },

  label: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 8,
  },

  input: {
    height: 52,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 15,
    color: colors.text,
    fontSize: 15,
  },

  messageError: {
    backgroundColor: "#FDECEC",
    borderWidth: 1,
    borderColor: "#F6C5C5",
    borderRadius: 10,
    padding: 11,
    marginBottom: 12,
  },

  messageErrorText: {
    color: colors.danger,
    fontSize: 13,
    lineHeight: 18,
  },

  messageInfo: {
    backgroundColor: "#EAF7EF",
    borderWidth: 1,
    borderColor: "#BCE4CA",
    borderRadius: 10,
    padding: 11,
    marginBottom: 12,
  },

  messageInfoText: {
    color: colors.success,
    fontSize: 13,
    lineHeight: 18,
  },

  submit: {
    minHeight: 52,
    backgroundColor: colors.primary,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
  },

  submitPressed: {
    backgroundColor: colors.primaryPressed,
  },

  submitDisabled: {
    opacity: 0.7,
  },

  submitText: {
    color: colors.textInverse,
    fontSize: 16,
    fontWeight: "800",
  },

  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
  },

  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },

  dividerText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: "600",
    marginHorizontal: 12,
  },

  google: {
    minHeight: 52,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: 13,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  googlePressed: {
    backgroundColor: colors.surfaceAlt,
  },

  googleDisabled: {
    opacity: 0.7,
  },

  googleIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 9,
    backgroundColor: colors.surfaceAlt,
  },

  googleIconText: {
    color: colors.primary,
    fontSize: 17,
    fontWeight: "800",
  },

  googleText: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "700",
  },

  footer: {
    color: colors.textMuted,
    fontSize: 11,
    textAlign: "center",
    marginTop: 20,
  },
});
