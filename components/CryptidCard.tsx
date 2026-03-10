import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import Colors from "@/constants/colors";
import { Cryptid, DANGER_COLORS, DANGER_LABELS } from "@/constants/data";

type Props = {
  cryptid: Cryptid;
  index?: number;
};

export function CryptidCard({ cryptid, index = 0 }: Props) {
  const dangerColor = DANGER_COLORS[cryptid.dangerLevel];

  return (
    <Pressable
      style={({ pressed }) => [styles.card, { opacity: pressed ? 0.85 : 1 }]}
      onPress={() => router.push({ pathname: "/cryptid/[id]", params: { id: cryptid.id } })}
    >
      <View style={[styles.accentBar, { backgroundColor: cryptid.color }]} />

      <View style={styles.body}>
        <View style={styles.header}>
          <View style={styles.nameBlock}>
            <Text style={styles.name}>{cryptid.name}</Text>
            {cryptid.nickname ? (
              <Text style={styles.nickname}>"{cryptid.nickname}"</Text>
            ) : null}
          </View>
          <View style={[styles.dangerBadge, { backgroundColor: dangerColor + "22" }]}>
            <View style={[styles.dangerDot, { backgroundColor: dangerColor }]} />
            <Text style={[styles.dangerText, { color: dangerColor }]}>
              {DANGER_LABELS[cryptid.dangerLevel]}
            </Text>
          </View>
        </View>

        <View style={styles.meta}>
          <View style={styles.metaItem}>
            <Ionicons name="location-outline" size={12} color={Colors.textMuted} />
            <Text style={styles.metaText}>{cryptid.region}</Text>
          </View>
          <View style={styles.metaSep} />
          <View style={styles.metaItem}>
            <Ionicons name="eye-outline" size={12} color={Colors.textMuted} />
            <Text style={styles.metaText}>Since {cryptid.firstSighted}</Text>
          </View>
        </View>

        <Text style={styles.description} numberOfLines={2}>
          {cryptid.description}
        </Text>

        <View style={styles.footer}>
          <View style={[styles.categoryBadge, { backgroundColor: cryptid.color + "20" }]}>
            <Text style={[styles.categoryText, { color: cryptid.color }]}>
              {cryptid.category}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
        </View>
      </View>
    </Pressable>
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
    gap: 8,
  },
  nameBlock: {
    flex: 1,
  },
  name: {
    fontSize: 17,
    fontWeight: "700",
    color: Colors.textPrimary,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.3,
  },
  nickname: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontFamily: "Inter_400Regular",
    marginTop: 1,
  },
  dangerBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
  },
  dangerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  dangerText: {
    fontSize: 11,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
  },
  meta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    fontSize: 11,
    color: Colors.textMuted,
    fontFamily: "Inter_400Regular",
  },
  metaSep: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: Colors.textMuted,
  },
  description: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 19,
    fontFamily: "Inter_400Regular",
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 2,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
  },
});
