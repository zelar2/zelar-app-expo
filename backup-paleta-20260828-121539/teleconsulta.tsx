// Porta de src/routes/_authenticated/teleconsulta.tsx. O original já é uma
// simulação (comentário próprio do arquivo: "Integração WebRTC/Daily será
// conectada em iteração seguinte"), usando APIs de browser (getUserMedia)
// que não existem em React Native. Aqui replicamos fielmente os mesmos
// estados/controles/testes com a mesma UX, prontos para plugar expo-camera
// + WebRTC/Daily quando a integração real for feita — sem alterar o fluxo.
import { useCallback, useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Stack } from "expo-router";

import { colors } from "@/theme/colors";

type TestStatus = "idle" | "testing" | "success" | "error";
interface TestResult {
  status: TestStatus;
  message?: string;
}

export default function TeleconsultaScreen() {
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [isCalling, setIsCalling] = useState(false);

  const [connectionTest, setConnectionTest] = useState<TestResult>({ status: "idle" });
  const [micTest, setMicTest] = useState<TestResult>({ status: "idle" });
  const [camTest, setCamTest] = useState<TestResult>({ status: "idle" });

  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => {
    return () => {
      timers.current.forEach(clearTimeout);
    };
  }, []);

  const toggleMic = useCallback(() => setMicOn((v) => !v), []);
  const toggleCam = useCallback(() => setCamOn((v) => !v), []);

  const endCall = useCallback(() => {
    setIsConnected(false);
    setIsCalling(false);
    setMicOn(true);
    setCamOn(true);
  }, []);

  const startCall = useCallback(() => {
    setIsCalling(true);
    const t = setTimeout(() => {
      setIsConnected(true);
      setIsCalling(false);
    }, 2000);
    timers.current.push(t);
  }, []);

  const testConnection = useCallback(async () => {
    setConnectionTest({ status: "testing" });
    try {
      const start = Date.now();
      const controller = new AbortController();
      const to = setTimeout(() => controller.abort(), 5000);
      await fetch("https://www.google.com/generate_204", { signal: controller.signal });
      clearTimeout(to);
      const latency = Date.now() - start;
      setConnectionTest({ status: "success", message: `Conexão estável — ${latency}ms` });
    } catch {
      setConnectionTest({ status: "error", message: "Sem conexão com a internet" });
    }
  }, []);

  const testMicrophone = useCallback(() => {
    setMicTest({ status: "testing" });
    const t = setTimeout(() => {
      setMicTest({ status: "success", message: "Microfone funcionando" });
    }, 1500);
    timers.current.push(t);
  }, []);

  const testCamera = useCallback(() => {
    setCamTest({ status: "testing" });
    const t = setTimeout(() => {
      setCamTest({ status: "success", message: "Câmera funcionando" });
    }, 1500);
    timers.current.push(t);
  }, []);

  const tests = [
    { key: "connection", label: "Testar conexão", result: connectionTest, action: testConnection },
    { key: "mic", label: "Testar microfone", result: micTest, action: testMicrophone },
    { key: "cam", label: "Testar câmera", result: camTest, action: testCamera },
  ] as const;

  return (
    <View style={styles.screen}>
      <Stack.Screen options={{ title: "Teleconsulta" }} />
      <View style={styles.container}>
        <View style={styles.videoArea}>
          <View style={styles.centerOverlay}>
            <View style={styles.videoIconCircle}>
              <Text style={{ fontSize: 32 }}>{isCalling ? "…" : "🎥"}</Text>
            </View>
          </View>

          <View style={styles.localPreview}>
            {!camOn && <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 18 }}>📷🚫</Text>}
          </View>

          <View style={styles.statusPill}>
            <View
              style={[
                styles.statusDot,
                { backgroundColor: isConnected ? "#34D399" : "#FBBF24" },
              ]}
            />
            <Text style={styles.statusText}>
              {isConnected ? "Em chamada" : isCalling ? "Conectando..." : "Pronto"}
            </Text>
          </View>

          <View style={styles.controls}>
            <Pressable
              onPress={toggleMic}
              style={[styles.controlBtn, !micOn && styles.controlBtnDanger]}
            >
              <Text style={styles.controlIcon}>{micOn ? "🎤" : "🔇"}</Text>
            </Pressable>
            <Pressable
              onPress={toggleCam}
              style={[styles.controlBtn, !camOn && styles.controlBtnDanger]}
            >
              <Text style={styles.controlIcon}>{camOn ? "📷" : "🚫"}</Text>
            </Pressable>
            <Pressable
              onPress={isConnected || isCalling ? endCall : startCall}
              style={[styles.controlBtn, styles.controlBtnEnd]}
            >
              <Text style={styles.controlIcon}>📞</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.testsRow}>
          {tests.map((t) => (
            <Pressable
              key={t.key}
              onPress={t.action}
              disabled={t.result.status === "testing"}
              style={styles.testCard}
            >
              <Text style={styles.testIcon}>
                {t.result.status === "testing"
                  ? "⏳"
                  : t.result.status === "success"
                    ? "✅"
                    : t.result.status === "error"
                      ? "❌"
                      : "•"}
              </Text>
              <Text style={styles.testLabel} numberOfLines={2}>
                {t.result.message || t.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {!isConnected && !isCalling && (
          <Pressable style={styles.startButton} onPress={startCall}>
            <Text style={styles.startButtonText}>Iniciar Teleconsulta</Text>
          </Pressable>
        )}
        {isCalling && (
          <View style={[styles.startButton, { opacity: 0.7 }]}>
            <Text style={styles.startButtonText}>Conectando com o médico...</Text>
          </View>
        )}

        <Text style={styles.footerNote}>
          {isConnected
            ? "Chamada criptografada ponta-a-ponta."
            : "Integração WebRTC/Daily será conectada em iteração seguinte."}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.card },
  container: { flex: 1, padding: 16 },
  videoArea: {
    aspectRatio: 9 / 14,
    borderRadius: 24,
    backgroundColor: "#1E293B",
    overflow: "hidden",
    justifyContent: "flex-end",
  },
  centerOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  videoIconCircle: {
    height: 96,
    width: 96,
    borderRadius: 48,
    backgroundColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  localPreview: {
    position: "absolute",
    top: 12,
    right: 12,
    height: 96,
    width: 64,
    borderRadius: 12,
    backgroundColor: "rgba(30,41,59,0.85)",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  statusPill: {
    position: "absolute",
    top: 12,
    left: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(0,0,0,0.4)",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { color: "rgba(255,255,255,0.9)", fontSize: 10, fontWeight: "600" },
  controls: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 14,
    paddingBottom: 18,
  },
  controlBtn: {
    height: 52,
    width: 52,
    borderRadius: 26,
    backgroundColor: "rgba(255,255,255,0.92)",
    alignItems: "center",
    justifyContent: "center",
  },
  controlBtnDanger: { backgroundColor: colors.danger },
  controlBtnEnd: { backgroundColor: colors.danger },
  controlIcon: { fontSize: 20 },
  testsRow: { flexDirection: "row", gap: 8, marginTop: 14 },
  testCard: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    padding: 10,
    alignItems: "center",
    gap: 6,
  },
  testIcon: { fontSize: 18 },
  testLabel: { fontSize: 10.5, fontWeight: "600", color: colors.text, textAlign: "center" },
  startButton: {
    marginTop: 12,
    borderRadius: 16,
    backgroundColor: colors.primary,
    paddingVertical: 15,
    alignItems: "center",
  },
  startButtonText: { color: colors.textInverse, fontWeight: "700", fontSize: 14 },
  footerNote: { marginTop: 10, textAlign: "center", fontSize: 11.5, color: colors.textMuted },
});
