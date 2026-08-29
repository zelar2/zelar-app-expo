// ZELAR+ — Upload de documentos
// Fluxo Native real:
// 1. escolhe arquivo
// 2. envia para Supabase Storage / bucket documentos
// 3. grava profissional_documentos
// 4. mantém tipo/type/title sincronizados com o schema real

import { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { useRouter } from "expo-router";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/auth-context";
import { colors } from "@/theme/colors";
import {
  AppButton,
  ChipSelect,
  FormField,
  TextField,
} from "@/components/ui/Kit";

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

const TITULOS: Record<DocumentoTipo, string> = {
  coren: "Registro COREN",
  crm: "Registro CRM",
  crp: "Registro CRP",
  crefito: "Registro CREFITO",
  crfa: "Registro CRFA",
  crn: "Registro CRN",
  rg: "RG",
  cpf: "CPF",
  diploma: "Diploma",
  certificado: "Certificado",
  comprovante_endereco: "Comprovante de endereço",
  outro: "Outro documento",
};

export default function UploadDocumentosScreen() {
  const { user } = useAuth();
  const router = useRouter();

  const [tipo, setTipo] = useState<DocumentoTipo>("coren");
  const [numero, setNumero] = useState("");
  const [orgaoEmissor, setOrgaoEmissor] = useState("");
  const [file, setFile] =
    useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [uploading, setUploading] = useState(false);

  async function pickFile() {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (result.canceled) {
        return;
      }

      setFile(result.assets[0]);
    } catch (error) {
      Alert.alert(
        "Erro",
        error instanceof Error
          ? error.message
          : "Não foi possível selecionar o arquivo.",
      );
    }
  }

  async function handleUpload() {
    if (!user) {
      Alert.alert(
        "Sessão necessária",
        "Faça login novamente para enviar documentos.",
      );
      return;
    }

    if (!file) {
      Alert.alert(
        "Selecione um arquivo",
        'Toque em "Escolher arquivo" antes de enviar.',
      );
      return;
    }

    setUploading(true);

    let storagePath: string | null = null;

    try {
      const originalName = file.name || "documento";
      const ext =
        originalName.includes(".")
          ? originalName.split(".").pop()?.toLowerCase() || "bin"
          : "bin";

      const safeBaseName = originalName
        .replace(/\.[^/.]+$/, "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-zA-Z0-9_-]/g, "-")
        .replace(/-+/g, "-")
        .slice(0, 80);

      storagePath =
        `${user.id}/${tipo}-${Date.now()}-${safeBaseName}.${ext}`;

      const response = await fetch(file.uri);

      if (!response.ok) {
        throw new Error(
          `Não foi possível acessar o arquivo selecionado (${response.status}).`,
        );
      }

      const blob = await response.blob();

      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(storagePath, blob, {
          upsert: false,
          contentType:
            file.mimeType || "application/octet-stream",
        });

      if (uploadError) {
        throw uploadError;
      }

      const title = TITULOS[tipo];

      const { error: insertError } = await supabase
        .from("profissional_documentos")
        .insert({
          profissional_id: user.id,

          // Campo oficial do enum/documento.
          tipo,

          // Compatibilidade com a estrutura já existente.
          type: tipo,

          // Título utilizado pelas telas.
          title,

          numero: numero.trim() || null,
          orgao_emissor: orgaoEmissor.trim() || null,

          file_path: storagePath,
          file_name: originalName,

          // O bucket pode ser privado.
          // A visualização será feita por signed URL.
          file_url: null,

          status: "pendente",
        });

      if (insertError) {
        await supabase.storage
          .from(BUCKET)
          .remove([storagePath]);

        storagePath = null;

        throw insertError;
      }

      Alert.alert(
        "Documento enviado",
        "O documento foi enviado com sucesso e está aguardando aprovação.",
        [
          {
            text: "OK",
            onPress: () => router.replace("/meus-documentos"),
          },
        ],
      );

      setFile(null);
      setNumero("");
      setOrgaoEmissor("");
    } catch (error) {
      if (storagePath) {
        await supabase.storage
          .from(BUCKET)
          .remove([storagePath]);
      }

      Alert.alert(
        "Erro ao enviar",
        error instanceof Error
          ? error.message
          : "Não foi possível enviar o documento.",
      );
    } finally {
      setUploading(false);
    }
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <Text style={styles.title}>Enviar documento</Text>

      <Text style={styles.subtitle}>
        Envie documentos profissionais para análise e aprovação.
      </Text>

      <FormField label="Tipo de documento" required>
        <ChipSelect
          value={tipo}
          options={TIPOS}
          onChange={(value) =>
            setTipo(value as DocumentoTipo)
          }
        />
      </FormField>

      <FormField label="Número (registro/CPF/RG)">
        <TextField
          value={numero}
          onChangeText={setNumero}
          placeholder="Digite o número"
        />
      </FormField>

      <FormField label="Órgão emissor">
        <TextField
          value={orgaoEmissor}
          onChangeText={setOrgaoEmissor}
          placeholder="Ex.: COREN-SP"
        />
      </FormField>

      <AppButton
        label={
          file
            ? `Arquivo: ${file.name}`
            : "Escolher arquivo"
        }
        variant="outline"
        onPress={pickFile}
        disabled={uploading}
      />

      <Text style={styles.separator} />

      <AppButton
        label={
          uploading
            ? "Enviando..."
            : "Enviar documento"
        }
        onPress={handleUpload}
        disabled={uploading}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  content: {
    padding: 16,
    paddingBottom: 48,
  },

  title: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.text,
    marginBottom: 6,
  },

  subtitle: {
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: 20,
  },

  separator: {
    height: 12,
  },
});
