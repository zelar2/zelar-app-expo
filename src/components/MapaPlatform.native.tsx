import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useQuery } from "@tanstack/react-query";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";

import { supabase } from "@/integrations/supabase/client";
import { colors } from "@/theme/colors";
import {
  Badge,
  Card,
  ErrorState,
  toneForStatus,
} from "@/components/ui/Kit";

interface CallPoint {
  id: string;
  address: string;
  status: string;
  lat: number;
  lng: number;
}

export default function MapaPlatform() {
  const [selected, setSelected] = useState<CallPoint | null>(null);

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

  const initialRegion = points[0]
    ? {
        latitude: points[0].lat,
        longitude: points[0].lng,
        latitudeDelta: 0.15,
        longitudeDelta: 0.15,
      }
    : {
        latitude: -23.55052,
        longitude: -46.633308,
        latitudeDelta: 0.4,
        longitudeDelta: 0.4,
      };

  return (
    <View style={styles.container}>
      {isLoading && (
        <View style={styles.centerOverlay}>
          <ActivityIndicator color={colors.primary} />
        </View>
      )}

      {error && (
        <View style={styles.errorBox}>
          <ErrorState message={(error as Error).message} />
        </View>
      )}

      <MapView
        style={StyleSheet.absoluteFillObject}
        provider={
          Platform.OS === "android" ? PROVIDER_GOOGLE : undefined
        }
        initialRegion={initialRegion}
      >
        {points.map((p) => (
          <Marker
            key={p.id}
            coordinate={{
              latitude: p.lat,
              longitude: p.lng,
            }}
            title={p.address}
            description={p.status}
            onPress={() => setSelected(p)}
          />
        ))}
      </MapView>

      {selected && (
        <Card style={styles.card}>
          <Text style={styles.address}>
            {selected.address}
          </Text>

          <View style={styles.badgeContainer}>
            <Badge
              label={selected.status}
              tone={toneForStatus(selected.status)}
            />
          </View>
        </Card>
      )}

      {!isLoading && points.length === 0 && !error && (
        <View style={styles.emptyOverlay}>
          <Text style={styles.emptyText}>
            Nenhuma chamada com localização cadastrada no momento.
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.card,
  },

  centerOverlay: {
    position: "absolute",
    top: 16,
    alignSelf: "center",
    zIndex: 2,
  },

  errorBox: {
    padding: 16,
  },

  card: {
    position: "absolute",
    bottom: 20,
    left: 16,
    right: 16,
  },

  address: {
    fontSize: 14.5,
    fontWeight: "700",
    color: colors.text,
  },

  badgeContainer: {
    marginTop: 6,
  },

  emptyOverlay: {
    position: "absolute",
    bottom: 24,
    left: 16,
    right: 16,
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },

  emptyText: {
    color: colors.textMuted,
    fontSize: 13,
    textAlign: "center",
  },
});
