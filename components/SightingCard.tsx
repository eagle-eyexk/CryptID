import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";
import { Sighting, useSightings } from "@/context/sightings";
import { CRYPTIDS } from "@/constants/data";

const TIME_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  Dawn: "partly-sunny-outline",
  Day: "sunny-outline",
  Dusk: "moon-outline",
  Night: "moon",
};

type Props = {
  sighting: Sighting;
};

export function SightingCard({ sighting }: Props) {
  const { deleteSighting } = useSightings();
  const cryptid = CRYPTIDS.find((c) => c.id === sighting.cryptidId);

  const date = new Date(sighting.date);
  const formatted = date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const handleDelete = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      "Delete Sighting",
      "Remove this sighting report?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteSighting(sighting.id),
        },
      ]
    );
  };

  const accentColor = cryptid?.color ?? Colors.primary;
  const timeIcon = TIME_ICONS[sighting.timeOfDay];

  return (
    <View style={styles.card}>
      <View style={[styles.accentBar, { backgroundColor: accentColor }]} />
      <View style={styles.body}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.cryptidName}>{sighting.cryptidName}</Text>
            <View style={styles.dateLine}>
              <Ionicons name="calendar-outline" size={11} color={Colors.textMuted} />
              <Text style={styles.dateText}>{formatted}</Text>
              <View style={styles.dot} />
              <Ionicons name={timeIcon} size={11} color={Colors.textMuted} />
              <Text style={styles.dateText}>{sighting.timeOfDay}</Text>
            </View>
          </View>
          <Pressable
            style={({ pressed }) => [styles.deleteBtn, { opacity: pressed ? 0.6 : 1 }]}
            onPress={handleDelete}
          >
            <Ionicons name="trash-outline" size={15} color={Colors.danger} />
          </Pressable>
        </View>

        <View style={styles.locationRow}>
          <Ionicons name="location-outline" size={13} color={Colors.textSecondary} />
          <Text style={styles.location}>{sighting.location}</Text>
        </View>

        <Text style={styles.description} numberOfLines={3}>
          {sighting.description}
        </Text>

        <View style={styles.footer}>
          {sighting.weather ? (
            <View style={styles.pill}>
              <Ionicons name="cloud-outline" size={11} color={Colors.textMuted} />
              <Text style={styles.pillText}>{sighting.weather}</Text>
            </View>
          ) : null}
          <View style={styles.pill}>
            <Ionicons name="people-outline" size={11} color={Colors.textMuted} />
            <Text style={styles.pillText}>
              {sighting.witnessCount} {sighting.witnessCount === 1 ? "witness" : "witnesses"}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    backgroundColor: Colors.surface,
    borderRadius: 16,
    marginBottom: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  accentBar: {
    width: 4,
  },
  body: {
    flex: 1,
    padding: 14,
    gap: 8,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  headerLeft: {
    flex: 1,
    gap: 3,
  },
  cryptidName: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.textPrimary,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.2,
  },
  dateLine: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  dateText: {
    fontSize: 11,
    color: Colors.textMuted,
    fontFamily: "Inter_400Regular",
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: Colors.textMuted,
  },
  deleteBtn: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    backgroundColor: Colors.dangerGlow,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  location: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontFamily: "Inter_500Medium",
  },
  description: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 20,
    fontFamily: "Inter_400Regular",
  },
  footer: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: Colors.surfaceElevated,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  pillText: {
    fontSize: 11,
    color: Colors.textMuted,
    fontFamily: "Inter_400Regular",
  },
});
