import { useMemo } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import { colors } from "@/theme/colors";
import { Badge, Card, ErrorState, toneForStatus } from "@/components/ui/Kit";

interface CallPoint {
  id: string;
  address: string;
  status: string;
  lat: number;
  lng: number;
}

export default function MapaPlatform() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["mapa-chamadas"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("service_calls")
        .select("id, address, status, lat, lng")
        .not("lat", "is", null)
        .not("lng", "is", null)
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;

      return (data ?? []) as CallPoint[];
    },
  });

  const points = useMemo(() => data ?? [], [data]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <Text style={styles.title}>
        Mapa de atendimentos
      </Text>

      <Text style={styles.subtitle}>
        Visualização das chamadas com localização cadastrada.
      </Text>

      {isLoading && (
        <View style={styles.loading}>
          <ActivityIndicator color={colors.primary} />
          <Text style={styles.loadingText}>
            Carregando localizações...
          </Text>
        </View>
      )}

      {error && (
        <View style={styles.error}>
          <ErrorState message={(error as Error).message} />
        </View>
      )}

      {!isLoading && !error && (
        <>
          <View style={styles.mapBox}>
            <Text style={styles.mapIcon}>📍</Text>

            <Text style={styles.mapTitle}>
              Mapa ZELAR+
            </Text>

            <Text style={styles.mapDescription}>
              {points.length > 0
                ? `${points.length} chamada(s) com localização cadastrada.`
                : "Nenhuma chamada com localização cadastrada no momento."}
            </Text>

            <Text style={styles.mapHint}>
              A visualização cartográfica nativa permanece disponível
              no aplicativo Android/iOS.
            </Text>
          </View>

          {points.length > 0 && (
            <View style={styles.list}>
              <Text style={styles.sectionTitle}>
                Localizações
              </Text>

              {points.map((point) => (
                <Card key={point.id} style={styles.item}>
                  <View style={styles.itemHeader}>
                    <Text style={styles.address}>
                      {point.address}
                    </Text>

                    <Badge
                      label={point.status}
                      tone={toneForStatus(point.status)}
                    />
                  </View>

                  <Text style={styles.coordinates}>
                    Latitude: {point.lat.toFixed(6)} · Longitude:{" "}
                    {point.lng.toFixed(6)}
                  </Text>
                </Card>
              ))}
            </View>
          )}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  content: {
    width: "100%",
    maxWidth: 1000,
    alignSelf: "center",
    padding: 24,
  },

  title: {
    fontSize: 24,
    fontWeight: "800",
    color: colors.text,
  },

  subtitle: {
    marginTop: 6,
    marginBottom: 20,
    fontSize: 14,
    color: colors.textSecondary,
  },

  loading: {
    minHeight: 260,
    alignItems: "center",
    justifyContent: "center",
  },

  loadingText: {
    marginTop: 10,
    color: colors.textMuted,
    fontSize: 13,
  },

  error: {
    marginTop: 10,
  },

  mapBox: {
    minHeight: 360,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },

  mapIcon: {
    fontSize: 56,
    marginBottom: 14,
  },

  mapTitle: {
    fontSize: 21,
    fontWeight: "800",
    color: colors.primary,
  },

  mapDescription: {
    marginTop: 10,
    textAlign: "center",
    fontSize: 15,
    color: colors.text,
  },

  mapHint: {
    maxWidth: 600,
    marginTop: 10,
    textAlign: "center",
    fontSize: 13,
    lineHeight: 20,
    color: colors.textMuted,
  },

  list: {
    marginTop: 24,
  },

  sectionTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.text,
    marginBottom: 10,
  },

  item: {
    marginBottom: 10,
  },

  itemHeader: {
    gap: 10,
  },

  address: {
    flex: 1,
    fontSize: 14,
    fontWeight: "700",
    color: colors.text,
  },

  coordinates: {
    marginTop: 8,
    fontSize: 11,
    color: colors.textMuted,
  },
});
