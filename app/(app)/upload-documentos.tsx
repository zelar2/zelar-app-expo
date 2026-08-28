// Enviar documentos — porta real de src/lib/documentos.ts::enviarDocumento.
// Usa expo-document-picker para escolher o arquivo e envia de verdade para
// o bucket "documentos" do Supabase Storage, depois grava a linha em
// profissional_documentos (mesma lógica e mesmo bucket do projeto web).
import { useState } from "react";
import { Alert, ScrollView, StyleSheet, Text } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { useRouter } from "expo-router";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/auth-context";
import { colors } from "@/theme/colors";
import { AppButton, ChipSelect, FormField, TextField } from "@/components/ui/Kit";


type DocumentoTipo =
  | "outro"
  | "coren"
  | "crm"
  | "crp"
  | "crefito"
  | "crfa"
  | "crn"
  | "rg"
  | "cpf"
  | "diploma"
  | "certificado"
  | "comprovante_endereco";


const BUCKET = "documentos";
const TIPOS: DocumentoTipo[] = [
  "coren",
  "crm",
  "crp",
  "crefito",
  "crfa",
  "crn",
  "rg",
  "cpf",
  "diploma",
  "certificado",
  "comprovante_endereco",
  "outro",
];

export default function UploadDocumentosScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [tipo, setTipo] = useState<DocumentoTipo>("coren");
  const [numero, setNumero] = useState("");
  const [orgaoEmissor, setOrgaoEmissor] = useState("");
  const [file, setFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [uploading, setUploading] = useState(false);

  async function pickFile() {
    const result = await DocumentPicker.getDocumentAsync({ type: "*/*", copyToCacheDirectory: true });
    if (result.canceled) return;
    setFile(result.assets[0]);
  }

  async function handleUpload() {
    if (!user) return;
    if (!file) {
      Alert.alert("Selecione um arquivo", "Toque em \"Escolher arquivo\" antes de enviar.");
      return;
    }
    setUploading(true);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() ?? "bin";
      const path = `${user.id}/${tipo}-${Date.now()}.${ext}`;

      const response = await fetch(file.uri);
      const blob = await response.blob();

      const up = await supabase.storage.from(BUCKET).upload(path, blob, {
        upsert: false,
        contentType: file.mimeType ?? "application/octet-stream",
      });
      if (up.error) throw up.error;

      const { error } = await supabase.from("profissional_documentos").insert({
        profissional_id: user.id,
        tipo: tipo,
        numero: numero || null,
        orgao_emissor: orgaoEmissor || null,
        file_path: path,
        file_name: file.name,
        status: "pendente",
      });
      if (error) {
        await supabase.storage.from(BUCKET).remove([path]);
        throw error;
      }

      Alert.alert("Enviado", "Documento enviado e aguardando aprovação.", [
        { text: "OK", onPress: () => router.replace("/documentos") },
      ]);
    } catch (e) {
      Alert.alert("Erro ao enviar", (e as Error).message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16, paddingBottom: 48 }}>
      <Text style={styles.title}>Enviar documento</Text>

      <FormField label="Tipo de documento" required>
        <ChipSelect value={tipo} options={TIPOS} onChange={(value) => setTipo(value as DocumentoTipo)} />
      </FormField>
      <FormField label="Número (registro/CPF/RG)">
        <TextField value={numero} onChangeText={setNumero} />
      </FormField>
      <FormField label="Órgão emissor">
        <TextField value={orgaoEmissor} onChangeText={setOrgaoEmissor} />
      </FormField>

      <AppButton label={file ? `Arquivo: ${file.name}` : "Escolher arquivo"} variant="outline" onPress={pickFile} />
      <Text style={{ height: 12 }} />
      <AppButton label={uploading ? "Enviando..." : "Enviar documento"} onPress={handleUpload} disabled={uploading} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.card },
  title: { fontSize: 20, fontWeight: "800", color: colors.text, marginBottom: 16 },
});
