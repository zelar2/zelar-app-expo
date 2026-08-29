import { useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useQuery } from "@tanstack/react-query";
import MapView, {
  Marker,
  PROVIDER_GOOGLE,
  Region,
} from "react-native-maps";
import * as Location from "expo-location";

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

const AVARE_REGION: Region = {
  latitude: -23.1069,
  longitude: -48.9253,
  latitudeDelta: 0.15,
  longitudeDelta: 0.15,
};

const STATUS_COLORS: Record<string, string> = {
  Pendente: "#EB5757",
  "Em andamento": "#F2C94C",
  Concluído: "#27AE60",
};

function markerColor(status: string) {
  return STATUS_COLORS[status] ?? "#2F80ED";
}

function MapMarker({
  status,
}: {
  status: string;
}) {
  return (
    <View style={styles.markerWrapper}>
      <View
        style={[
          styles.marker,
          {
            backgroundColor: markerColor(status),
          },
        ]}
      />
    </View>
  );
}

export default function MapaPlatform() {
  const mapRef = useRef<MapView>(null);
  const [selected, setSelected] = useState<CallPoint | null>(null);
  const [locating, setLocating] = useState(false);

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

      if (error) {
        throw error;
      }

      return (data ?? []) as CallPoint[];
    },
  });

  const points = useMemo(
    () =>
      (data ?? []).filter(
        (point) =>
          Number.isFinite(Number(point.lat)) &&
          Number.isFinite(Number(point.lng)),
      ),
    [data],
  );

  const goToMyLocation = async () => {
    if (locating) {
      return;
    }

    try {
      setLocating(true);

      const { status } =
        await Location.requestForegroundPermissionsAsync();

      if (status !== Location.PermissionStatus.GRANTED) {
        Alert.alert(
          "Localização",
          "Permita o acesso à localização para usar este recurso.",
        );
        return;
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      mapRef.current?.animateToRegion(
        {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          latitudeDelta: 0.03,
          longitudeDelta: 0.03,
        },
        700,
      );
    } catch (locationError) {
      Alert.alert(
        "Localização",
        locationError instanceof Error
          ? locationError.message
          : "Não foi possível obter sua localização.",
      );
    } finally {
      setLocating(false);
    }
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFillObject}
        provider={
          Platform.OS === "android" ? PROVIDER_GOOGLE : undefined
        }
        initialRegion={AVARE_REGION}
        showsUserLocation
        showsMyLocationButton={false}
        showsCompass
        toolbarEnabled={false}
        onPress={() => setSelected(null)}
      >
        {points.map((point) => (
          <Marker
            key={point.id}
            coordinate={{
              latitude: Number(point.lat),
              longitude: Number(point.lng),
            }}
            title={point.address}
            description={point.status}
            onPress={() => setSelected(point)}
            tracksViewChanges={false}
          >
            <MapMarker status={point.status} />
          </Marker>
        ))}
      </MapView>

      <View pointerEvents="box-none" style={styles.topControls}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Minha localização"
          onPress={goToMyLocation}
          style={({ pressed }) => [
            styles.locationButton,
            pressed && styles.locationButtonPressed,
          ]}
        >
          {locating ? (
            <ActivityIndicator
              size="small"
              color={colors.primary}
            />
          ) : (
            <Text style={styles.locationIcon}>⌖</Text>
          )}

          <Text style={styles.locationText}>
            Minha localização
          </Text>
        </Pressable>
      </View>

      {isLoading && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingCard}>
            <ActivityIndicator color={colors.primary} />
            <Text style={styles.loadingText}>
              Carregando localizações...
            </Text>
          </View>
        </View>
      )}

      {error && (
        <View style={styles.errorOverlay}>
          <ErrorState message={(error as Error).message} />
        </View>
      )}

      {selected && (
        <Card style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleArea}>
              <Text style={styles.cardTitle}>
                Atendimento
              </Text>

              <Text
                numberOfLines={2}
                style={styles.address}
              >
                {selected.address}
              </Text>
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Fechar atendimento selecionado"
              onPress={() => setSelected(null)}
              hitSlop={10}
              style={styles.closeButton}
            >
              <Text style={styles.closeText}>×</Text>
            </Pressable>
          </View>

          <View style={styles.badgeContainer}>
            <Badge
              label={selected.status}
              tone={toneForStatus(selected.status)}
            />
          </View>

          <Text style={styles.coordinates}>
            {Number(selected.lat).toFixed(6)} ·{" "}
            {Number(selected.lng).toFixed(6)}
          </Text>
        </Card>
      )}

      {!isLoading && points.length === 0 && !error && (
        <View style={styles.emptyOverlay}>
          <Text style={styles.emptyTitle}>
            Nenhuma localização
          </Text>

          <Text style={styles.emptyText}>
            Nenhuma chamada com localização cadastrada no momento.
          </Text>
        </View>
      )}

      {!isLoading && points.length > 0 && !selected && (
        <View style={styles.counter}>
          <Text style={styles.counterText}>
            {points.length}{" "}
            {points.length === 1
              ? "atendimento localizado"
              : "atendimentos localizados"}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  topControls: {
    position: "absolute",
    top: 14,
    right: 14,
    left: 14,
    alignItems: "flex-end",
  },

  locationButton: {
    minHeight: 42,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.12,
    shadowRadius: 5,
    elevation: 4,
  },

  locationButtonPressed: {
    opacity: 0.75,
  },

  locationIcon: {
    fontSize: 20,
    color: colors.primary,
    fontWeight: "800",
  },

  locationText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "700",
  },

  markerWrapper: {
    width: 26,
    height: 26,
    alignItems: "center",
    justifyContent: "center",
  },

  marker: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 3,
    borderColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.35,
    shadowRadius: 3,
    elevation: 4,
  },

  loadingOverlay: {
    position: "absolute",
    top: 68,
    alignSelf: "center",
  },

  loadingCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: colors.card,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.12,
    shadowRadius: 5,
    elevation: 4,
  },

  loadingText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: "600",
  },

  errorOverlay: {
    position: "absolute",
    left: 16,
    right: 16,
    top: 72,
  },

  card: {
    position: "absolute",
    bottom: 20,
    left: 16,
    right: 16,
    padding: 16,
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
  },

  cardTitleArea: {
    flex: 1,
    paddingRight: 10,
  },

  cardTitle: {
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    color: colors.primary,
    marginBottom: 4,
  },

  address: {
    fontSize: 14.5,
    lineHeight: 20,
    fontWeight: "700",
    color: colors.text,
  },

  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
  },

  closeText: {
    fontSize: 23,
    lineHeight: 25,
    color: colors.textSecondary,
    fontWeight: "400",
  },

  badgeContainer: {
    marginTop: 10,
  },

  coordinates: {
    marginTop: 9,
    fontSize: 10.5,
    color: colors.textMuted,
  },

  emptyOverlay: {
    position: "absolute",
    bottom: 24,
    left: 16,
    right: 16,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },

  emptyTitle: {
    textAlign: "center",
    fontSize: 14,
    fontWeight: "800",
    color: colors.text,
  },

  emptyText: {
    marginTop: 5,
    textAlign: "center",
    fontSize: 12.5,
    lineHeight: 18,
    color: colors.textMuted,
  },

  counter: {
    position: "absolute",
    bottom: 18,
    left: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  counterText: {
    color: colors.textSecondary,
    fontSize: 11.5,
    fontWeight: "700",
  },
});
