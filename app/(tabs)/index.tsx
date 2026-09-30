import React from "react";
import { View, Text, StyleSheet, FlatList, Pressable, Platform, Alert, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import Colors from "@/constants/colors";
import { useChats } from "@/context/chats";

function timeAgo(ts: number): string {
  const seconds = Math.max(0, Math.floor((Date.now() - ts) / 1000));
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export default function ChatsScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const desktop = Platform.OS === "web" && width >= 900;
  const { conversations, deleteConversation, isLoading } = useChats();
  const sorted = [...conversations].sort((a, b) => b.createdAt - a.createdAt);

  const handleDelete = (id: string, name: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const remove = () => { void deleteConversation(id); };
    if (Platform.OS === "web") {
      if (typeof window !== "undefined" && window.confirm(`Delete “${name}” and its pending messages from this session?`)) remove();
      return;
    }
    Alert.alert("Delete channel", `Remove “${name}” and its pending messages from this session?`, [
      { text: "Keep channel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: remove },
    ]);
  };

  const openChat = (id: string) => router.push({ pathname: "/chat/[id]", params: { id } });

  return (
    <View style={styles.container}>
      <FlatList
        data={sorted}
        keyExtractor={(item) => item.id}
        scrollEnabled={!!sorted.length}
        contentContainerStyle={[
          styles.page,
          { paddingTop: Platform.OS === "web" ? (desktop ? 58 : 30) : insets.top + 18, paddingBottom: Platform.OS === "web" && !desktop ? 94 : insets.bottom + 36 },
        ]}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.content}>
            <View style={styles.eyebrowRow}>
              <View style={styles.liveDot} />
              <Text style={styles.eyebrow}>LOCAL SESSION / MEMORY ONLY</Text>
              <Text style={styles.sessionTag}>01</Text>
            </View>
            <View style={[styles.heroRow, !desktop && styles.heroStack]}>
              <View style={styles.heroCopy}>
                <Text style={styles.title}>A quieter kind{desktop ? "\nof conversation." : " of conversation."}</Text>
                <Text style={styles.subtitle}>Short-lived channels for words that don’t need a history.</Text>
              </View>
              <Pressable
                accessibilityRole="button"
                style={({ pressed }) => [styles.newButton, pressed && styles.pressed]}
                onPress={() => router.push("/new")}
              >
                <Ionicons name="add" size={18} color={Colors.background} />
                <Text style={styles.newButtonText}>New channel</Text>
              </Pressable>
            </View>
            <View style={styles.sectionHeading}>
              <View>
                <Text style={styles.sectionTitle}>Current channels</Text>
                <Text style={styles.sectionHint}>Only present in this open runtime</Text>
              </View>
              <View style={styles.countPill}>
                <Text style={styles.countText}>{String(sorted.length).padStart(2, "0")}</Text>
                <Text style={styles.countLabel}>OPEN</Text>
              </View>
            </View>
          </View>
        }
        renderItem={({ item, index }) => (
          <View style={[styles.channelWrap, desktop && styles.channelWide]}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Open channel ${item.name}`}
              style={({ pressed }) => [styles.channelRow, pressed && styles.pressed]}
              onPress={() => openChat(item.id)}
              onLongPress={() => handleDelete(item.id, item.name)}
            >
              <View style={styles.rowIndex}><Text style={styles.rowIndexText}>{String(index + 1).padStart(2, "0")}</Text></View>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{item.name.charAt(0).toUpperCase()}</Text>
              </View>
              <View style={styles.chatInfo}>
                <Text style={styles.chatName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.chatPreview} numberOfLines={1}>
                  {item.messages.length ? "A message is waiting to be seen" : "An empty channel, ready when you are"}
                </Text>
              </View>
              <View style={styles.rowMeta}>
                <Text style={styles.chatTime}>{timeAgo(item.createdAt)}</Text>
                <View style={styles.viewOnce}><Ionicons name="eye-off-outline" size={13} color={Colors.primary} /><Text style={styles.viewOnceText}>VIEW ONCE</Text></View>
              </View>
              <Ionicons name="arrow-forward" size={16} color={Colors.textMuted} style={styles.rowArrow} />
            </Pressable>
            {Platform.OS === "web" ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Delete channel ${item.name}`}
                style={({ pressed }) => [styles.deleteButton, pressed && styles.pressed]}
                onPress={() => handleDelete(item.id, item.name)}
              >
                <Ionicons name="trash-outline" size={16} color={Colors.textMuted} />
              </Pressable>
            ) : null}
          </View>
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          isLoading ? (
            <View style={styles.emptyPanel}>
              <View style={styles.skeletonLine} /><View style={[styles.skeletonLine, styles.skeletonShort]} />
            </View>
          ) : (
            <View style={styles.emptyPanel}>
              <View style={styles.emptyGraphic}>
                <View style={styles.orbitOne} /><View style={styles.orbitTwo} />
                <Ionicons name="chatbubble-ellipses-outline" size={24} color={Colors.primary} />
              </View>
              <Text style={styles.emptyKicker}>NOTHING LINGERING</Text>
              <Text style={styles.emptyTitle}>Begin with a blank channel.</Text>
              <Text style={styles.emptyText}>Messages entered here stay on this device’s active runtime. There is no remote recipient or delivery.</Text>
              <Pressable style={({ pressed }) => [styles.emptyAction, pressed && styles.pressed]} onPress={() => router.push("/new")}>
                <Text style={styles.emptyActionText}>Create a local channel</Text>
                <Ionicons name="arrow-forward" size={16} color={Colors.background} />
              </Pressable>
            </View>
          )
        }
        ListFooterComponent={
          sorted.length ? (
            <View style={styles.footnote}>
              <Ionicons name="information-circle-outline" size={15} color={Colors.textMuted} />
              <Text style={styles.footnoteText}>Channels and messages are held in memory only. A reload ends this session.</Text>
            </View>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  page: { paddingHorizontal: 24, alignItems: "center", flexGrow: 1 },
  content: { width: "100%", maxWidth: 1040 },
  eyebrowRow: { flexDirection: "row", alignItems: "center", gap: 9, marginBottom: 27 },
  liveDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: Colors.primary },
  eyebrow: { fontSize: 10, fontFamily: "Inter_700Bold", color: Colors.primary, letterSpacing: 2.2 },
  sessionTag: { marginLeft: "auto", borderWidth: 1, borderColor: Colors.border, color: Colors.textMuted, borderRadius: 5, paddingHorizontal: 7, paddingVertical: 3, fontSize: 10, fontFamily: "Inter_600SemiBold" },
  heroRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", gap: 24, paddingBottom: 54, borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  heroStack: { alignItems: "flex-start", flexDirection: "column", paddingBottom: 37, gap: 22 },
  heroCopy: { flex: 1 },
  title: { color: Colors.textPrimary, fontFamily: "Georgia", fontSize: 42, letterSpacing: -1.9, lineHeight: 48, maxWidth: 590 },
  subtitle: { color: Colors.textSecondary, fontFamily: "Inter_400Regular", fontSize: 15, lineHeight: 23, marginTop: 14, maxWidth: 470 },
  newButton: { flexDirection: "row", alignItems: "center", gap: 9, backgroundColor: Colors.primary, borderRadius: 8, paddingHorizontal: 17, paddingVertical: 13, minHeight: 46 },
  newButtonText: { fontSize: 13, fontFamily: "Inter_700Bold", color: Colors.background },
  pressed: { opacity: 0.72, transform: [{ scale: 0.99 }] },
  sectionHeading: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingTop: 31, paddingBottom: 17 },
  sectionTitle: { color: Colors.textPrimary, fontFamily: "Inter_600SemiBold", fontSize: 17 },
  sectionHint: { color: Colors.textMuted, fontFamily: "Inter_400Regular", fontSize: 12, marginTop: 5 },
  countPill: { flexDirection: "row", alignItems: "center", gap: 7, borderWidth: 1, borderColor: Colors.border, borderRadius: 5, paddingVertical: 6, paddingHorizontal: 9 },
  countText: { color: Colors.textPrimary, fontFamily: "Inter_600SemiBold", fontSize: 12 },
  countLabel: { color: Colors.textMuted, fontFamily: "Inter_600SemiBold", fontSize: 9, letterSpacing: 1.2 },
  channelWrap: { width: "100%", maxWidth: 1040, position: "relative" },
  channelWide: { paddingRight: 44 },
  channelRow: { flexDirection: "row", alignItems: "center", minHeight: 88, gap: 16, paddingHorizontal: 12, borderRadius: 10 },
  rowIndex: { width: 28 },
  rowIndexText: { color: Colors.textMuted, fontSize: 10, fontFamily: "Inter_500Medium" },
  avatar: { width: 44, height: 44, borderRadius: 14, backgroundColor: Colors.surfaceElevated, borderWidth: 1, borderColor: Colors.border, alignItems: "center", justifyContent: "center" },
  avatarText: { color: Colors.primary, fontFamily: "Inter_700Bold", fontSize: 17 },
  chatInfo: { flex: 1, gap: 5, minWidth: 0 },
  chatName: { color: Colors.textPrimary, fontFamily: "Inter_600SemiBold", fontSize: 15 },
  chatPreview: { color: Colors.textSecondary, fontFamily: "Inter_400Regular", fontSize: 12 },
  rowMeta: { alignItems: "flex-end", gap: 8 },
  chatTime: { color: Colors.textMuted, fontFamily: "Inter_400Regular", fontSize: 11 },
  viewOnce: { flexDirection: "row", alignItems: "center", gap: 5 },
  viewOnceText: { color: Colors.primary, fontFamily: "Inter_600SemiBold", fontSize: 8, letterSpacing: 1.2 },
  rowArrow: { marginLeft: 7 },
  separator: { height: 1, backgroundColor: Colors.borderLight, width: "100%", maxWidth: 1040 },
  deleteButton: { position: "absolute", right: 0, top: "50%", width: 36, height: 36, marginTop: -18, alignItems: "center", justifyContent: "center", borderRadius: 8 },
  emptyPanel: { width: "100%", maxWidth: 1040, minHeight: 330, backgroundColor: Colors.surface, borderColor: Colors.border, borderWidth: 1, borderRadius: 14, justifyContent: "center", alignItems: "center", padding: 28, gap: 13 },
  emptyGraphic: { width: 68, height: 68, alignItems: "center", justifyContent: "center", backgroundColor: Colors.primaryFaint, borderRadius: 22, borderWidth: 1, borderColor: Colors.border, marginBottom: 5 },
  orbitOne: { position: "absolute", width: 94, height: 94, borderWidth: 1, borderColor: Colors.borderLight, borderRadius: 48 },
  orbitTwo: { position: "absolute", width: 116, height: 116, borderWidth: 1, borderColor: Colors.borderLight, borderRadius: 60, opacity: 0.5 },
  emptyKicker: { color: Colors.primary, fontFamily: "Inter_700Bold", fontSize: 9, letterSpacing: 2.1 },
  emptyTitle: { color: Colors.textPrimary, fontFamily: "Inter_600SemiBold", fontSize: 19, textAlign: "center" },
  emptyText: { color: Colors.textSecondary, fontFamily: "Inter_400Regular", fontSize: 13, lineHeight: 20, textAlign: "center", maxWidth: 430 },
  emptyAction: { marginTop: 9, backgroundColor: Colors.primary, flexDirection: "row", alignItems: "center", gap: 12, borderRadius: 8, paddingHorizontal: 16, paddingVertical: 12 },
  emptyActionText: { color: Colors.background, fontFamily: "Inter_600SemiBold", fontSize: 12 },
  footnote: { width: "100%", maxWidth: 1040, marginTop: 21, flexDirection: "row", gap: 8, alignItems: "center" },
  footnoteText: { color: Colors.textMuted, fontFamily: "Inter_400Regular", fontSize: 11, lineHeight: 17, flex: 1 },
  skeletonLine: { width: "35%", height: 12, backgroundColor: Colors.surfaceElevated, borderRadius: 6 },
  skeletonShort: { width: "22%", marginTop: 6 },
});