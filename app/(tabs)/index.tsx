import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Platform,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import Colors from "@/constants/colors";
import { useChats, BURN_LABELS } from "@/context/chats";

function timeAgo(ts: number): string {
  const diffSec = Math.floor((Date.now() - ts) / 1000);
  if (diffSec < 60) return "just now";
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  return `${Math.floor(diffSec / 86400)}d ago`;
}

export default function ChatsScreen() {
  const insets = useSafeAreaInsets();
  const { conversations, deleteConversation } = useChats();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const sorted = [...conversations].sort((a, b) => {
    const aLast = a.messages[a.messages.length - 1]?.timestamp ?? a.createdAt;
    const bLast = b.messages[b.messages.length - 1]?.timestamp ?? b.createdAt;
    return bLast - aLast;
  });

  const handleDelete = (id: string, name: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      "Burn Conversation",
      `Permanently destroy all messages with "${name}"? This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Burn",
          style: "destructive",
          onPress: () => deleteConversation(id),
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.secureIndicator}>
            <View style={styles.secureLight} />
            <Text style={styles.secureText}>SECURE</Text>
          </View>
          <Text style={styles.title}>Chats</Text>
        </View>
        <Pressable
          style={({ pressed }) => [styles.newBtn, { opacity: pressed ? 0.8 : 1 }]}
          onPress={() => router.push("/new")}
        >
          <Ionicons name="add" size={22} color={Colors.background} />
        </Pressable>
      </View>

      <FlatList
        data={sorted}
        keyExtractor={(item) => item.id}
        scrollEnabled={!!sorted.length}
        contentContainerStyle={[
          styles.list,
          { paddingBottom: Platform.OS === "web" ? 84 + 16 : insets.bottom + 16 },
        ]}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const lastMsg = item.messages[item.messages.length - 1];
          const msgCount = item.messages.length;
          const lastTime = lastMsg?.timestamp ?? item.createdAt;
          return (
            <Pressable
              style={({ pressed }) => [styles.chatRow, { opacity: pressed ? 0.85 : 1 }]}
              onPress={() => router.push({ pathname: "/chat/[id]", params: { id: item.id } })}
              onLongPress={() => handleDelete(item.id, item.name)}
            >
              {/* Avatar */}
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {item.name.charAt(0).toUpperCase()}
                </Text>
              </View>

              <View style={styles.chatInfo}>
                <View style={styles.chatTop}>
                  <Text style={styles.chatName} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={styles.chatTime}>{timeAgo(lastTime)}</Text>
                </View>
                <View style={styles.chatBottom}>
                  <Text style={styles.chatPreview} numberOfLines={1}>
                    {lastMsg ? lastMsg.text : "No messages yet"}
                  </Text>
                  <View style={styles.chatMeta}>
                    {item.burnTimer !== -1 && (
                      <View style={styles.burnBadge}>
                        <Ionicons name="flame" size={10} color={Colors.danger} />
                        <Text style={styles.burnBadgeText}>
                          {BURN_LABELS[item.burnTimer]}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            </Pressable>
          );
        }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <View style={styles.emptyIcon}>
              <Ionicons name="lock-closed-outline" size={36} color={Colors.textMuted} />
            </View>
            <Text style={styles.emptyTitle}>No active channels</Text>
            <Text style={styles.emptyText}>Start an encrypted conversation</Text>
            <Pressable
              style={({ pressed }) => [styles.emptyBtn, { opacity: pressed ? 0.8 : 1 }]}
              onPress={() => router.push("/new")}
            >
              <Ionicons name="add" size={16} color={Colors.background} />
              <Text style={styles.emptyBtnText}>New Channel</Text>
            </Pressable>
          </View>
        }
        ItemSeparatorComponent={() => (
          <View style={styles.separator} />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 18,
  },
  headerLeft: {
    gap: 4,
  },
  secureIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  secureLight: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.green,
  },
  secureText: {
    fontSize: 10,
    fontWeight: "700",
    color: Colors.green,
    fontFamily: "Inter_700Bold",
    letterSpacing: 2,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: Colors.textPrimary,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.5,
  },
  newBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  list: {
    paddingHorizontal: 16,
  },
  chatRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 6,
    gap: 12,
    borderRadius: 14,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.surfaceHigh,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 20,
    fontWeight: "600",
    color: Colors.primary,
    fontFamily: "Inter_600SemiBold",
  },
  chatInfo: {
    flex: 1,
    gap: 4,
  },
  chatTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  chatName: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: Colors.textPrimary,
    fontFamily: "Inter_600SemiBold",
  },
  chatTime: {
    fontSize: 12,
    color: Colors.textMuted,
    fontFamily: "Inter_400Regular",
  },
  chatBottom: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  chatPreview: {
    flex: 1,
    fontSize: 13,
    color: Colors.textSecondary,
    fontFamily: "Inter_400Regular",
  },
  chatMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  burnBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: Colors.dangerGlow,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  burnBadgeText: {
    fontSize: 10,
    color: Colors.danger,
    fontFamily: "Inter_600SemiBold",
  },
  separator: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginLeft: 68,
    marginRight: 6,
  },
  empty: {
    alignItems: "center",
    paddingTop: 80,
    gap: 12,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.surface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 4,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.textSecondary,
    fontFamily: "Inter_600SemiBold",
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textMuted,
    fontFamily: "Inter_400Regular",
  },
  emptyBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Colors.primary,
    paddingHorizontal: 22,
    paddingVertical: 13,
    borderRadius: 24,
    marginTop: 10,
  },
  emptyBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.background,
    fontFamily: "Inter_600SemiBold",
  },
});
