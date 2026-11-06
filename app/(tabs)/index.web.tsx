import React, { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import Colors from "@/constants/colors";
import { useAuth } from "@/context/auth";
import { useChats } from "@/context/chats";
import { apiFetch } from "@/utils/api";

function relativeTime(timestamp: number) {
  const seconds = Math.max(0, Math.floor((Date.now() - timestamp) / 1000));
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  return `${Math.floor(seconds / 3600)}h ago`;
}

function expiryLabel(value?: string) {
  if (!value) return "Server-enforced";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Server-enforced";
  return date.toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default function ChatsScreen() {
  const { width } = useWindowDimensions();
  const desktop = width >= 900;
  const { user } = useAuth();
  const { conversations, deleteConversation } = useChats();
  const [publicDetails, setPublicDetails] = useState<number | null>(null);
  const sorted = [...conversations].sort((a, b) => b.createdAt - a.createdAt);

  useEffect(() => {
    let active = true;
    apiFetch("/api/security/ghost-log")
      .then(async (response) => {
        if (!response.ok) throw new Error("Public status unavailable.");
        const data = (await response.json()) as { publicDetails?: unknown };
        if (active && data.publicDetails === 0) setPublicDetails(0);
      })
      .catch(() => {
        if (active) setPublicDetails(null);
      });
    return () => { active = false; };
  }, []);

  function removeChannel(id: string, name: string) {
    if (typeof window !== "undefined" && window.confirm(`Remove “${name}” and its local previews from this browser?`)) {
      void deleteConversation(id);
    }
  }

  return (
    <View style={styles.page}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.topline}>
            <View style={styles.brandMark}><Ionicons name="eye-off-outline" size={16} color={Colors.surface} /></View>
            <View>
              <Text style={styles.wordmark}>CryptID</Text>
              <Text style={styles.brandCaption}>A ROOM FOR THE MOMENT</Text>
            </View>
            <View style={styles.userPill}>
              <View style={styles.userDot} />
              <Text style={styles.userText}>{user?.username ?? "Account"}</Text>
            </View>
          </View>

          <View style={[styles.hero, desktop ? styles.heroDesktop : styles.heroMobile]}>
            <View style={styles.heroCopy}>
              <Text style={styles.eyebrow}>SHARED ACCOUNT · LOCAL CHAT PREVIEWS</Text>
              <Text style={[styles.title, !desktop && styles.titleMobile]}>A quieter kind of conversation.</Text>
              <Text style={styles.subtitle}>
                Your account works across devices. The channels on this page stay in this browser and are not delivered to another person.
              </Text>
            </View>
            <Pressable
              accessibilityRole="button"
              style={({ pressed }) => [styles.newButton, pressed && styles.pressed]}
              onPress={() => router.push("/new")}
            >
              <Ionicons name="add" size={18} color={Colors.surface} />
              <Text style={styles.newButtonText}>New local channel</Text>
            </Pressable>
          </View>

          <View style={[styles.statusGrid, !desktop && styles.statusGridMobile]}>
            <View style={styles.statusCard}>
              <View style={styles.statusIcon}><Ionicons name="time-outline" size={16} color={Colors.primary} /></View>
              <View style={styles.statusCopy}>
                <Text style={styles.statusTitle}>Login session</Text>
                <Text style={styles.statusDescription}>Ends {expiryLabel(user?.sessionExpiresAt)}</Text>
              </View>
              <Text style={styles.statusValue}>24h</Text>
            </View>
            <View style={styles.statusCard}>
              <View style={styles.statusIcon}><Ionicons name="eye-off-outline" size={16} color={Colors.accent} /></View>
              <View style={styles.statusCopy}>
                <Text style={styles.statusTitle}>Public ghost log</Text>
                <Text style={styles.statusDescription}>Public disclosure only</Text>
              </View>
              <Text style={[styles.statusValue, styles.zeroValue]}>{publicDetails === null ? "—" : publicDetails}</Text>
            </View>
          </View>

          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Your open channels</Text>
              <Text style={styles.sectionCaption}>Stored only in this browser’s active runtime</Text>
            </View>
            <View style={styles.countPill}>
              <Text style={styles.countNumber}>{String(sorted.length).padStart(2, "0")}</Text>
              <Text style={styles.countLabel}>OPEN</Text>
            </View>
          </View>

          {sorted.length ? (
            <View style={styles.channelList}>
              {sorted.map((channel, index) => (
                <View key={channel.id} style={styles.channelRow}>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Open channel ${channel.name}`}
                    style={({ pressed }) => [styles.channelOpen, pressed && styles.channelPressed]}
                    onPress={() => router.push({ pathname: "/chat/[id]", params: { id: channel.id } })}
                  >
                    <Text style={styles.rowIndex}>{String(index + 1).padStart(2, "0")}</Text>
                    <View style={styles.avatar}><Text style={styles.avatarText}>{channel.name.charAt(0).toUpperCase()}</Text></View>
                    <View style={styles.channelInfo}>
                      <Text numberOfLines={1} style={styles.channelName}>{channel.name}</Text>
                      <Text numberOfLines={1} style={styles.channelPreview}>
                        {channel.messages.length ? "A local preview is waiting" : "An empty room, ready when you are"}
                      </Text>
                    </View>
                    <View style={styles.channelMeta}>
                      <Text style={styles.timeText}>{relativeTime(channel.createdAt)}</Text>
                      <Text style={styles.localTag}>LOCAL · VIEW ONCE</Text>
                    </View>
                    <Ionicons name="arrow-forward" size={15} color={Colors.textMuted} />
                  </Pressable>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Delete channel ${channel.name}`}
                    onPress={() => removeChannel(channel.id, channel.name)}
                    style={({ pressed }) => [styles.deleteButton, pressed && styles.pressed]}
                  >
                    <Ionicons name="trash-outline" size={16} color={Colors.textMuted} />
                  </Pressable>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyCard}>
              <View style={styles.emptyMark}><Ionicons name="chatbubble-ellipses-outline" size={21} color={Colors.primary} /></View>
              <Text style={styles.emptyEyebrow}>NOTHING LINGERING</Text>
              <Text style={styles.emptyTitle}>Begin with a blank room.</Text>
              <Text style={styles.emptyText}>Messages entered here are temporary local previews. There is no remote recipient, delivery, or end-to-end encryption.</Text>
              <Pressable
                accessibilityRole="button"
                style={({ pressed }) => [styles.emptyButton, pressed && styles.pressed]}
                onPress={() => router.push("/new")}
              >
                <Text style={styles.emptyButtonText}>Create a local channel</Text>
                <Ionicons name="arrow-forward" size={15} color={Colors.surface} />
              </Pressable>
            </View>
          )}

          <View style={styles.footerNotice}>
            <Ionicons name="information-circle-outline" size={15} color={Colors.accent} />
            <Text style={styles.footerText}>
              Account and login are shared across devices. Channel names and message previews are not; reloading this browser clears them.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: Colors.background },
  scroll: { flexGrow: 1, alignItems: "center", paddingHorizontal: 30, paddingTop: 30, paddingBottom: 48 },
  content: { width: "100%", maxWidth: 1020 },
  topline: { flexDirection: "row", alignItems: "center", gap: 11, paddingBottom: 21, borderBottomWidth: 1, borderBottomColor: Colors.border },
  brandMark: { width: 31, height: 31, borderRadius: 10, borderBottomLeftRadius: 3, backgroundColor: Colors.primary, alignItems: "center", justifyContent: "center" },
  wordmark: { color: Colors.textPrimary, fontFamily: "Georgia", fontSize: 18 },
  brandCaption: { color: Colors.textMuted, fontFamily: "Inter_600SemiBold", fontSize: 7, letterSpacing: 1.3, marginTop: 3 },
  userPill: { marginLeft: "auto", flexDirection: "row", alignItems: "center", gap: 7, paddingHorizontal: 11, paddingVertical: 7, borderRadius: 22, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.surface },
  userDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.green },
  userText: { color: Colors.textSecondary, fontFamily: "Inter_500Medium", fontSize: 10 },
  hero: { justifyContent: "space-between", alignItems: "flex-end", gap: 24, paddingVertical: 45, borderBottomWidth: 1, borderBottomColor: Colors.border },
  heroDesktop: { flexDirection: "row" },
  heroMobile: { flexDirection: "column", alignItems: "flex-start", paddingVertical: 34 },
  heroCopy: { flex: 1, maxWidth: 650 },
  eyebrow: { color: Colors.accent, fontFamily: "Inter_700Bold", fontSize: 8, letterSpacing: 1.7, marginBottom: 13 },
  title: { color: Colors.textPrimary, fontFamily: "Georgia", fontSize: 43, lineHeight: 49, letterSpacing: -1.4 },
  titleMobile: { fontSize: 35, lineHeight: 41 },
  subtitle: { maxWidth: 560, color: Colors.textSecondary, fontFamily: "Inter_400Regular", fontSize: 12, lineHeight: 19, marginTop: 13 },
  newButton: { flexDirection: "row", alignItems: "center", gap: 9, minHeight: 43, borderRadius: 9, paddingHorizontal: 15, backgroundColor: Colors.primary },
  newButtonText: { color: Colors.surface, fontFamily: "Inter_600SemiBold", fontSize: 10 },
  pressed: { opacity: 0.78 },
  statusGrid: { flexDirection: "row", gap: 13, paddingTop: 20 },
  statusGridMobile: { flexDirection: "column" },
  statusCard: { flex: 1, minHeight: 68, flexDirection: "row", alignItems: "center", gap: 11, paddingHorizontal: 13, borderWidth: 1, borderColor: Colors.border, borderRadius: 11, backgroundColor: Colors.surface },
  statusIcon: { width: 31, height: 31, borderRadius: 10, backgroundColor: Colors.surfaceHigh, alignItems: "center", justifyContent: "center" },
  statusCopy: { flex: 1, gap: 4 },
  statusTitle: { color: Colors.textPrimary, fontFamily: "Inter_600SemiBold", fontSize: 10 },
  statusDescription: { color: Colors.textMuted, fontFamily: "Inter_400Regular", fontSize: 9 },
  statusValue: { color: Colors.primary, fontFamily: "Georgia", fontSize: 19 },
  zeroValue: { color: Colors.accent },
  sectionHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingTop: 34, paddingBottom: 14 },
  sectionTitle: { color: Colors.textPrimary, fontFamily: "Inter_600SemiBold", fontSize: 14 },
  sectionCaption: { color: Colors.textMuted, fontFamily: "Inter_400Regular", fontSize: 10, marginTop: 5 },
  countPill: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 9, paddingVertical: 6, borderWidth: 1, borderColor: Colors.border, borderRadius: 6 },
  countNumber: { color: Colors.textPrimary, fontFamily: "Inter_600SemiBold", fontSize: 10 },
  countLabel: { color: Colors.textMuted, fontFamily: "Inter_600SemiBold", fontSize: 7, letterSpacing: 1 },
  channelList: { borderTopWidth: 1, borderTopColor: Colors.border },
  channelRow: { minHeight: 76, flexDirection: "row", alignItems: "center", borderBottomWidth: 1, borderBottomColor: Colors.border },
  channelOpen: { flex: 1, minWidth: 0, minHeight: 76, flexDirection: "row", alignItems: "center", gap: 14, paddingHorizontal: 10 },
  channelPressed: { backgroundColor: Colors.surfaceHigh },
  rowIndex: { width: 22, color: Colors.textMuted, fontFamily: "Inter_500Medium", fontSize: 9 },
  avatar: { width: 39, height: 39, borderRadius: 13, backgroundColor: Colors.surfaceHigh, borderWidth: 1, borderColor: Colors.border, alignItems: "center", justifyContent: "center" },
  avatarText: { color: Colors.primary, fontFamily: "Inter_700Bold", fontSize: 14 },
  channelInfo: { flex: 1, minWidth: 0, gap: 5 },
  channelName: { color: Colors.textPrimary, fontFamily: "Inter_600SemiBold", fontSize: 12 },
  channelPreview: { color: Colors.textMuted, fontFamily: "Inter_400Regular", fontSize: 10 },
  channelMeta: { alignItems: "flex-end", gap: 6, marginHorizontal: 8 },
  timeText: { color: Colors.textMuted, fontFamily: "Inter_400Regular", fontSize: 8 },
  localTag: { color: Colors.primary, fontFamily: "Inter_700Bold", fontSize: 7, letterSpacing: 0.8 },
  deleteButton: { width: 34, height: 34, alignItems: "center", justifyContent: "center", borderRadius: 8 },
  emptyCard: { minHeight: 290, alignItems: "center", justifyContent: "center", padding: 28, gap: 11, borderWidth: 1, borderColor: Colors.border, borderRadius: 15, backgroundColor: Colors.surface },
  emptyMark: { width: 53, height: 53, borderRadius: 18, alignItems: "center", justifyContent: "center", backgroundColor: Colors.surfaceHigh, borderWidth: 1, borderColor: Colors.border, marginBottom: 2 },
  emptyEyebrow: { color: Colors.accent, fontFamily: "Inter_700Bold", fontSize: 8, letterSpacing: 1.6 },
  emptyTitle: { color: Colors.textPrimary, fontFamily: "Georgia", fontSize: 23, textAlign: "center" },
  emptyText: { maxWidth: 420, color: Colors.textSecondary, fontFamily: "Inter_400Regular", fontSize: 10, lineHeight: 17, textAlign: "center" },
  emptyButton: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 6, paddingHorizontal: 14, paddingVertical: 11, borderRadius: 8, backgroundColor: Colors.primary },
  emptyButtonText: { color: Colors.surface, fontFamily: "Inter_600SemiBold", fontSize: 10 },
  footerNotice: { flexDirection: "row", alignItems: "flex-start", gap: 8, marginTop: 20, paddingTop: 14, borderTopWidth: 1, borderTopColor: Colors.border },
  footerText: { flex: 1, color: Colors.textMuted, fontFamily: "Inter_400Regular", fontSize: 9, lineHeight: 15 },
});
