import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import { CRYPTIDS, DANGER_COLORS, DANGER_LABELS } from "@/constants/data";
import { useSightings } from "@/context/sightings";

export default function CryptidDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { sightings } = useSightings();

  const cryptid = CRYPTIDS.find((c) => c.id === id);
  const relatedSightings = sightings.filter((s) => s.cryptidId === id);

  if (!cryptid) {
    return (
      <View style={styles.notFound}>
        <Ionicons name="alert-circle-outline" size={40} color={Colors.textMuted} />
        <Text style={styles.notFoundText}>Cryptid not found</Text>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backLink}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  const dangerColor = DANGER_COLORS[cryptid.dangerLevel];
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  return (
    <View style={styles.container}>
      {/* Hero */}
      <View style={[styles.hero, { paddingTop: topPad + 12 }]}>
        <View style={[styles.heroBg, { backgroundColor: cryptid.color + "14" }]} />
        <Pressable
          style={[styles.backBtn, { top: topPad + 10 }]}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={20} color={Colors.textPrimary} />
        </Pressable>

        <View style={styles.heroContent}>
          <View style={[styles.categoryPill, { backgroundColor: cryptid.color + "22" }]}>
            <Text style={[styles.categoryPillText, { color: cryptid.color }]}>
              {cryptid.category}
            </Text>
          </View>
          <Text style={styles.heroName}>{cryptid.name}</Text>
          {cryptid.nickname ? (
            <Text style={styles.heroNickname}>"{cryptid.nickname}"</Text>
          ) : null}

          <View style={styles.heroMeta}>
            <View style={styles.heroMetaItem}>
              <Ionicons name="location-outline" size={13} color={Colors.textSecondary} />
              <Text style={styles.heroMetaText}>{cryptid.region}</Text>
            </View>
            <View style={styles.heroMetaDot} />
            <View style={styles.heroMetaItem}>
              <Ionicons name="eye-outline" size={13} color={Colors.textSecondary} />
              <Text style={styles.heroMetaText}>Since {cryptid.firstSighted}</Text>
            </View>
          </View>

          {/* Danger Level */}
          <View style={[styles.dangerBar, { backgroundColor: dangerColor + "15" }]}>
            <View style={styles.dangerLeft}>
              <View style={[styles.dangerDot, { backgroundColor: dangerColor }]} />
              <Text style={styles.dangerLabel}>Danger Level</Text>
            </View>
            <View style={styles.dangerRight}>
              <Text style={[styles.dangerValue, { color: dangerColor }]}>
                {DANGER_LABELS[cryptid.dangerLevel]}
              </Text>
              <View style={styles.dangerPips}>
                {[1, 2, 3, 4, 5].map((pip) => (
                  <View
                    key={pip}
                    style={[
                      styles.pip,
                      {
                        backgroundColor:
                          pip <= cryptid.dangerLevel ? dangerColor : Colors.border,
                      },
                    ]}
                  />
                ))}
              </View>
            </View>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Platform.OS === "web" ? 84 + 24 : insets.bottom + 24 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Description */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="document-text-outline" size={16} color={Colors.textMuted} />
            <Text style={styles.cardTitle}>PROFILE</Text>
          </View>
          <Text style={styles.descriptionText}>{cryptid.description}</Text>
        </View>

        {/* Abilities */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="flash-outline" size={16} color={Colors.textMuted} />
            <Text style={styles.cardTitle}>KNOWN ABILITIES</Text>
          </View>
          {cryptid.abilities.map((ability, i) => (
            <View key={i} style={styles.abilityRow}>
              <View style={[styles.abilityBullet, { backgroundColor: cryptid.color }]} />
              <Text style={styles.abilityText}>{ability}</Text>
            </View>
          ))}
        </View>

        {/* Evidence */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="search-outline" size={16} color={Colors.textMuted} />
            <Text style={styles.cardTitle}>EVIDENCE ON RECORD</Text>
          </View>
          <View style={styles.evidenceBox}>
            <Ionicons name="information-circle-outline" size={16} color={cryptid.color} />
            <Text style={styles.evidenceText}>{cryptid.evidence}</Text>
          </View>
        </View>

        {/* Sightings */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="eye-outline" size={16} color={Colors.textMuted} />
            <Text style={styles.cardTitle}>FILED SIGHTINGS</Text>
            <View style={styles.sightingCount}>
              <Text style={styles.sightingCountText}>{relatedSightings.length}</Text>
            </View>
          </View>
          {relatedSightings.length === 0 ? (
            <Text style={styles.noSightings}>No sightings reported yet</Text>
          ) : (
            relatedSightings.map((s) => (
              <View key={s.id} style={styles.miniSighting}>
                <View style={styles.miniSightingHeader}>
                  <Ionicons name="location-outline" size={12} color={Colors.textMuted} />
                  <Text style={styles.miniSightingLocation}>{s.location}</Text>
                  <Text style={styles.miniSightingDate}>
                    {new Date(s.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </Text>
                </View>
                <Text style={styles.miniSightingDesc} numberOfLines={2}>
                  {s.description}
                </Text>
              </View>
            ))
          )}

          <Pressable
            style={({ pressed }) => [styles.reportBtn, { opacity: pressed ? 0.8 : 1 }]}
            onPress={() => router.push("/(tabs)/log")}
          >
            <Ionicons name="add" size={15} color={Colors.primary} />
            <Text style={styles.reportBtnText}>Report a Sighting</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  notFound: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  notFoundText: {
    fontSize: 18,
    color: Colors.textSecondary,
    fontFamily: "Inter_500Medium",
  },
  backLink: {
    fontSize: 15,
    color: Colors.primary,
    fontFamily: "Inter_500Medium",
  },
  hero: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    position: "relative",
    overflow: "hidden",
  },
  heroBg: {
    ...StyleSheet.absoluteFillObject,
  },
  backBtn: {
    position: "absolute",
    left: 20,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.border,
    zIndex: 10,
  },
  heroContent: {
    paddingTop: 44,
    gap: 8,
  },
  categoryPill: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  categoryPillText: {
    fontSize: 11,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.5,
  },
  heroName: {
    fontSize: 32,
    fontWeight: "700",
    color: Colors.textPrimary,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.8,
  },
  heroNickname: {
    fontSize: 15,
    color: Colors.textSecondary,
    fontFamily: "Inter_400Regular",
    fontStyle: "italic",
    marginTop: -4,
  },
  heroMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },
  heroMetaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  heroMetaText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontFamily: "Inter_400Regular",
  },
  heroMetaDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: Colors.textMuted,
  },
  dangerBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginTop: 8,
  },
  dangerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dangerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dangerLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontFamily: "Inter_500Medium",
  },
  dangerRight: {
    alignItems: "flex-end",
    gap: 4,
  },
  dangerValue: {
    fontSize: 13,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
  },
  dangerPips: {
    flexDirection: "row",
    gap: 4,
  },
  pip: {
    width: 20,
    height: 4,
    borderRadius: 2,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 12,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 12,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  cardTitle: {
    fontSize: 11,
    fontWeight: "600",
    color: Colors.textMuted,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 1.5,
    flex: 1,
  },
  sightingCount: {
    backgroundColor: Colors.primaryGlow,
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  sightingCountText: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.primary,
    fontFamily: "Inter_700Bold",
  },
  descriptionText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 22,
    fontFamily: "Inter_400Regular",
  },
  abilityRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  abilityBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 7,
    flexShrink: 0,
  },
  abilityText: {
    flex: 1,
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 21,
    fontFamily: "Inter_400Regular",
  },
  evidenceBox: {
    flexDirection: "row",
    gap: 10,
    alignItems: "flex-start",
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 10,
    padding: 12,
  },
  evidenceText: {
    flex: 1,
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 20,
    fontFamily: "Inter_400Regular",
  },
  noSightings: {
    fontSize: 13,
    color: Colors.textMuted,
    fontFamily: "Inter_400Regular",
    fontStyle: "italic",
  },
  miniSighting: {
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    paddingTop: 10,
    gap: 5,
  },
  miniSightingHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  miniSightingLocation: {
    flex: 1,
    fontSize: 12,
    color: Colors.textSecondary,
    fontFamily: "Inter_500Medium",
  },
  miniSightingDate: {
    fontSize: 11,
    color: Colors.textMuted,
    fontFamily: "Inter_400Regular",
  },
  miniSightingDesc: {
    fontSize: 13,
    color: Colors.textMuted,
    lineHeight: 19,
    fontFamily: "Inter_400Regular",
  },
  reportBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: Colors.primary + "50",
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
    backgroundColor: Colors.primaryFaint,
  },
  reportBtnText: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.primary,
    fontFamily: "Inter_600SemiBold",
  },
});
