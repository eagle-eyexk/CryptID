import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";
import type { NativeSyntheticEvent, TextInputKeyPressEventData } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import Colors from "@/constants/colors";
import { useAuth } from "@/context/auth";
import { Message, useChats } from "@/context/chats";
import { apiFetch } from "@/utils/api";

function clockTime(timestamp: number) {
  return new Date(timestamp).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}

function expiryText(value?: string) {
  if (!value) return "Fixed 24-hour login";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Fixed 24-hour login";
  return `Login ends ${date.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}`;
}

function MessageBubble({ message }: { message: Message }) {
  return (
    <View style={[styles.messageRow, message.fromMe ? styles.messageRowMe : styles.messageRowThem]}>
      <View style={[styles.messageBubble, message.fromMe ? styles.messageBubbleMe : styles.messageBubbleThem]}>
        <Text style={[styles.messageText, message.fromMe && styles.messageTextMe]}>{message.text}</Text>
        <View style={styles.messageMeta}>
          <Text style={[styles.messageTime, message.fromMe && styles.messageTimeMe]}>{clockTime(message.timestamp)}</Text>
          <Ionicons name="eye-off-outline" size={11} color={message.fromMe ? "#D0DFD5" : Colors.textMuted} />
        </View>
      </View>
    </View>
  );
}

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { width } = useWindowDimensions();
  const desktop = width >= 1120;
  const { user } = useAuth();
  const { getConversation, sendMessage, burnAllMessages, deleteConversation, markMessagesSeen } = useChats();
  const conversation = getConversation(id);
  const [draft, setDraft] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [publicDetails, setPublicDetails] = useState<number | null>(null);
  const inputRef = useRef<TextInput>(null);
  const messageScroll = useRef<ScrollView>(null);
  const seenTimers = useRef(new Map<string, ReturnType<typeof setTimeout>>());

  useEffect(() => {
    let active = true;
    apiFetch("/api/security/ghost-log")
      .then(async (response) => {
        if (!response.ok) throw new Error("Status unavailable.");
        const result = (await response.json()) as { publicDetails?: unknown };
        if (active && result.publicDetails === 0) setPublicDetails(0);
      })
      .catch(() => {
        if (active) setPublicDetails(null);
      });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    conversation?.messages.forEach((message) => {
      if (seenTimers.current.has(message.id)) return;
      const timer = setTimeout(() => {
        markMessagesSeen(id, [message.id]);
        seenTimers.current.delete(message.id);
      }, 1200);
      seenTimers.current.set(message.id, timer);
    });
  }, [conversation?.messages, id, markMessagesSeen]);

  useEffect(() => () => {
    seenTimers.current.forEach((timer) => clearTimeout(timer));
    seenTimers.current.clear();
  }, []);

  useEffect(() => {
    if (conversation?.messages.length) {
      requestAnimationFrame(() => messageScroll.current?.scrollToEnd({ animated: true }));
    }
  }, [conversation?.messages.length]);

  const handleSend = useCallback(async () => {
    const text = draft.trim();
    if (!text || !conversation) return;
    setDraft("");
    await sendMessage(id, text);
    inputRef.current?.focus();
  }, [conversation, draft, id, sendMessage]);

  function onInputKeyPress(event: NativeSyntheticEvent<TextInputKeyPressEventData>) {
    const keyEvent = event.nativeEvent as TextInputKeyPressEventData & { shiftKey?: boolean };
    if (Platform.OS === "web" && keyEvent.key === "Enter" && !keyEvent.shiftKey) {
      event.preventDefault();
      void handleSend();
    }
  }

  function clearRoom() {
    setMenuOpen(false);
    if (typeof window !== "undefined" && window.confirm("Remove pending local previews from this channel?")) {
      void burnAllMessages(id);
    }
  }

  function removeRoom() {
    setMenuOpen(false);
    if (typeof window !== "undefined" && window.confirm("Delete this local channel from this browser? Your account will remain.")) {
      void deleteConversation(id);
      router.replace("/(tabs)");
    }
  }

  if (!conversation) {
    return (
      <View style={styles.notFound}>
        <View style={styles.notFoundIcon}><Ionicons name="close" size={20} color={Colors.accent} /></View>
        <Text style={styles.notFoundTitle}>This local room is no longer open.</Text>
        <Text style={styles.notFoundCopy}>Channel state stays in this browser runtime and is cleared on reload.</Text>
        <Pressable accessibilityRole="button" style={styles.backLink} onPress={() => router.replace("/(tabs)")}>
          <Text style={styles.backLinkText}>Return to channels</Text>
        </Pressable>
      </View>
    );
  }

  const messages = conversation.messages;

  return (
    <KeyboardAvoidingView style={styles.page} behavior="padding">
      <View style={styles.topbar}>
        <View style={styles.topbarInner}>
          <Pressable accessibilityRole="button" accessibilityLabel="Back to channels" style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={17} color={Colors.textPrimary} />
          </Pressable>
          <View style={styles.brandMark}><Ionicons name="eye-off-outline" size={15} color={Colors.surface} /></View>
          <View>
            <Text style={styles.wordmark}>CryptID</Text>
            <Text style={styles.brandCaption}>LOCAL ROOM</Text>
          </View>
          <View style={styles.topbarSpacer} />
          <View style={styles.sessionPill}>
            <Ionicons name="time-outline" size={13} color={Colors.primary} />
            <Text style={styles.sessionText}>{expiryText(user?.sessionExpiresAt)}</Text>
          </View>
          <View style={styles.menuWrap}>
            <Pressable accessibilityRole="button" accessibilityLabel="Room options" accessibilityState={{ expanded: menuOpen }} style={styles.menuButton} onPress={() => setMenuOpen((open) => !open)}>
              <Ionicons name="ellipsis-horizontal" size={19} color={Colors.textSecondary} />
            </Pressable>
            {menuOpen ? (
              <View style={styles.menu}>
                <Pressable accessibilityRole="button" style={styles.menuItem} onPress={clearRoom}>
                  <Ionicons name="eye-off-outline" size={14} color={Colors.textSecondary} />
                  <Text style={styles.menuText}>Clear local previews</Text>
                </Pressable>
                <Pressable accessibilityRole="button" style={styles.menuItem} onPress={removeRoom}>
                  <Ionicons name="trash-outline" size={14} color={Colors.accent} />
                  <Text style={styles.menuDanger}>Delete local room</Text>
                </Pressable>
              </View>
            ) : null}
          </View>
        </View>
      </View>

      <View style={[styles.layout, !desktop && styles.layoutMobile]}>
        <View style={styles.chatColumn}>
          <View style={styles.chatPanel}>
            <View style={styles.chatHeader}>
              <View style={styles.roomMark}><Ionicons name="sparkles-outline" size={18} color={Colors.primary} /></View>
              <View style={styles.roomIdentity}>
                <Text style={styles.roomName}>{conversation.name}</Text>
                <View style={styles.roomStatus}><View style={styles.statusDot} /><Text style={styles.roomStatusText}>This browser · local preview</Text></View>
              </View>
              <View style={styles.viewOnce}><Ionicons name="eye-off-outline" size={13} color={Colors.accent} /><Text style={styles.viewOnceText}>VIEW ONCE</Text></View>
            </View>

            <View style={styles.deliveryNotice}>
              <Ionicons name="information-circle-outline" size={16} color={Colors.primary} />
              <Text style={styles.deliveryText}>
                Messages stay in this browser. They are not delivered to another person and are not end-to-end encrypted.
              </Text>
            </View>

            <ScrollView
              ref={messageScroll}
              style={styles.messageList}
              contentContainerStyle={[styles.messageListContent, messages.length === 0 && styles.messageListEmpty]}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {messages.length ? messages.map((message) => <MessageBubble key={message.id} message={message} />) : (
                <View style={styles.emptyState}>
                  <View style={styles.emptyStamp}><Ionicons name="eye-off-outline" size={21} color={Colors.accent} /></View>
                  <Text style={styles.emptyEyebrow}>NO CONVERSATION HISTORY</Text>
                  <Text style={styles.emptyTitle}>Say it while the room is open.</Text>
                  <Text style={styles.emptyCopy}>Your message is a local preview, not a delivery. It disappears about 1.2 seconds after first appearing.</Text>
                </View>
              )}
            </ScrollView>

            <View style={styles.composerArea}>
              <View style={styles.composer}>
                <TextInput
                  ref={inputRef}
                  accessibilityLabel="Write a local message preview"
                  maxLength={500}
                  multiline
                  onChangeText={setDraft}
                  onKeyPress={onInputKeyPress}
                  placeholder="Write a message for this moment"
                  placeholderTextColor={Colors.textMuted}
                  style={styles.input}
                  value={draft}
                />
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Send local preview"
                  disabled={!draft.trim()}
                  onPress={() => void handleSend()}
                  style={({ pressed }) => [styles.sendButton, !draft.trim() && styles.sendDisabled, pressed && !!draft.trim() && styles.pressed]}
                >
                  <Ionicons name="arrow-up" size={18} color={draft.trim() ? Colors.surface : Colors.textMuted} />
                </Pressable>
              </View>
              <View style={styles.composerMeta}>
                <Text style={styles.composerHint}>Enter to preview · Shift + Enter for a line break</Text>
                <Text style={styles.composerCount}>{draft.length} / 500</Text>
              </View>
            </View>
          </View>
        </View>

        {desktop ? (
          <View style={styles.sidePanel}>
            <Text style={styles.sideHeading}>CLEAR LIMITS</Text>
            <View style={styles.fact}>
              <View style={styles.factHeader}><Ionicons name="time-outline" size={14} color={Colors.primary} /><Text style={styles.factTitle}>Login session</Text></View>
              <Text style={styles.factMetric}>24 hours</Text>
              <Text style={styles.factCopy}>The shared account login ends on the server after 24 hours. This does not delete the account.</Text>
            </View>
            <View style={styles.fact}>
              <View style={styles.factHeader}><Ionicons name="eye-off-outline" size={14} color={Colors.accent} /><Text style={styles.factTitle}>Message preview</Text></View>
              <Text style={styles.factMetric}>~1.2 sec</Text>
              <Text style={styles.factCopy}>Local previews are removed after appearing. Nothing is sent to a remote recipient.</Text>
            </View>
            <View style={[styles.fact, styles.lastFact]}>
              <View style={styles.factHeader}><Ionicons name="shield-checkmark-outline" size={14} color={Colors.primary} /><Text style={styles.factTitle}>Public disclosure</Text></View>
              <View style={styles.publicCount}>
                <Text style={styles.publicNumber}>{publicDetails === null ? "—" : publicDetails}</Text>
                <Text style={styles.publicLabel}>public details</Text>
              </View>
              <Text style={styles.factCopy}>Private auth events may exist; public 0 does not mean zero private records.</Text>
            </View>
            <Text style={styles.sideFoot}>Account: {user?.username ?? "signed in"}{`\n`}Session: {expiryText(user?.sessionExpiresAt)}</Text>
          </View>
        ) : (
          <View style={styles.mobileFoot}>
            <Text style={styles.mobileFootText}>Public details: {publicDetails === null ? "—" : publicDetails} · Login ends after 24 hours</Text>
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: Colors.background },
  notFound: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24, backgroundColor: Colors.background, gap: 11 },
  notFoundIcon: { width: 45, height: 45, alignItems: "center", justifyContent: "center", borderRadius: 15, backgroundColor: Colors.accentGlow },
  notFoundTitle: { color: Colors.textPrimary, fontFamily: "Inter_600SemiBold", fontSize: 14, textAlign: "center" },
  notFoundCopy: { maxWidth: 340, color: Colors.textSecondary, fontFamily: "Inter_400Regular", fontSize: 10, lineHeight: 16, textAlign: "center" },
  backLink: { padding: 8, marginTop: 3 },
  backLinkText: { color: Colors.primary, fontFamily: "Inter_600SemiBold", fontSize: 10 },
  topbar: { minHeight: 62, paddingHorizontal: 19, borderBottomWidth: 1, borderBottomColor: Colors.border, backgroundColor: Colors.surface },
  topbarInner: { flex: 1, width: "100%", maxWidth: 1200, alignSelf: "center", flexDirection: "row", alignItems: "center", gap: 10 },
  backButton: { width: 31, height: 31, alignItems: "center", justifyContent: "center", borderRadius: 10 },
  brandMark: { width: 27, height: 27, alignItems: "center", justifyContent: "center", borderRadius: 9, borderBottomLeftRadius: 3, backgroundColor: Colors.primary },
  wordmark: { color: Colors.textPrimary, fontFamily: "Georgia", fontSize: 15 },
  brandCaption: { color: Colors.textMuted, fontFamily: "Inter_600SemiBold", fontSize: 6, letterSpacing: 1, marginTop: 2 },
  topbarSpacer: { flex: 1 },
  sessionPill: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 9, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: Colors.border },
  sessionText: { color: Colors.textSecondary, fontFamily: "Inter_500Medium", fontSize: 8 },
  menuWrap: { position: "relative", zIndex: 5 },
  menuButton: { width: 32, height: 32, alignItems: "center", justifyContent: "center", borderRadius: 10 },
  menu: { position: "absolute", top: 37, right: 0, width: 190, padding: 5, borderWidth: 1, borderColor: Colors.border, borderRadius: 10, backgroundColor: Colors.surface, shadowColor: "#252A28", shadowOpacity: 0.12, shadowRadius: 14, elevation: 4 },
  menuItem: { minHeight: 37, flexDirection: "row", alignItems: "center", gap: 9, paddingHorizontal: 9, borderRadius: 7 },
  menuText: { color: Colors.textPrimary, fontFamily: "Inter_500Medium", fontSize: 9 },
  menuDanger: { color: Colors.accent, fontFamily: "Inter_500Medium", fontSize: 9 },
  layout: { flex: 1, width: "100%", maxWidth: 1200, alignSelf: "center", flexDirection: "row", justifyContent: "center", gap: 28, paddingHorizontal: 20, paddingVertical: 20, minHeight: 0 },
  layoutMobile: { paddingHorizontal: 10, paddingVertical: 10 },
  chatColumn: { flex: 1, maxWidth: 760, minWidth: 0 },
  chatPanel: { flex: 1, minHeight: 0, overflow: "hidden", borderWidth: 1, borderColor: Colors.border, borderRadius: 16, backgroundColor: Colors.surface },
  chatHeader: { minHeight: 66, flexDirection: "row", alignItems: "center", gap: 11, paddingHorizontal: 15, borderBottomWidth: 1, borderBottomColor: Colors.border },
  roomMark: { width: 36, height: 36, alignItems: "center", justifyContent: "center", borderRadius: 13, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.surfaceHigh },
  roomIdentity: { flex: 1, gap: 4 },
  roomName: { color: Colors.textPrimary, fontFamily: "Georgia", fontSize: 17 },
  roomStatus: { flexDirection: "row", alignItems: "center", gap: 6 },
  roomStatusText: { color: Colors.textMuted, fontFamily: "Inter_400Regular", fontSize: 8 },
  statusDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: Colors.green },
  viewOnce: { flexDirection: "row", alignItems: "center", gap: 5 },
  viewOnceText: { color: Colors.accent, fontFamily: "Inter_700Bold", fontSize: 7, letterSpacing: 0.9 },
  deliveryNotice: { flexDirection: "row", alignItems: "flex-start", gap: 9, marginHorizontal: 14, marginTop: 13, padding: 10, borderWidth: 1, borderColor: "#D5DDD1", borderRadius: 10, backgroundColor: "#EDF1E9" },
  deliveryText: { flex: 1, color: "#44564A", fontFamily: "Inter_400Regular", fontSize: 8, lineHeight: 14 },
  messageList: { flex: 1, minHeight: 0 },
  messageListContent: { flexGrow: 1, justifyContent: "flex-end", paddingHorizontal: 15, paddingVertical: 16, gap: 8 },
  messageListEmpty: { justifyContent: "center" },
  messageRow: { flexDirection: "row" },
  messageRowMe: { justifyContent: "flex-end" },
  messageRowThem: { justifyContent: "flex-start" },
  messageBubble: { maxWidth: "80%", minWidth: 110, paddingHorizontal: 13, paddingVertical: 10, borderRadius: 14 },
  messageBubbleMe: { backgroundColor: Colors.primary, borderBottomRightRadius: 4 },
  messageBubbleThem: { backgroundColor: Colors.surfaceHigh, borderWidth: 1, borderColor: Colors.border, borderBottomLeftRadius: 4 },
  messageText: { color: Colors.textPrimary, fontFamily: "Inter_400Regular", fontSize: 11, lineHeight: 17 },
  messageTextMe: { color: Colors.surface },
  messageMeta: { flexDirection: "row", justifyContent: "flex-end", alignItems: "center", gap: 5, marginTop: 6 },
  messageTime: { color: Colors.textMuted, fontFamily: "Inter_400Regular", fontSize: 7 },
  messageTimeMe: { color: "#D0DFD5" },
  emptyState: { alignSelf: "center", alignItems: "center", maxWidth: 340, padding: 24, gap: 10 },
  emptyStamp: { width: 50, height: 50, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: Colors.border, borderRadius: 25, backgroundColor: "#F7F2E8" },
  emptyEyebrow: { color: Colors.accent, fontFamily: "Inter_700Bold", fontSize: 7, letterSpacing: 1.5 },
  emptyTitle: { color: Colors.textPrimary, fontFamily: "Georgia", fontSize: 22, textAlign: "center" },
  emptyCopy: { color: Colors.textSecondary, fontFamily: "Inter_400Regular", fontSize: 9, lineHeight: 15, textAlign: "center" },
  composerArea: { paddingHorizontal: 13, paddingBottom: 13 },
  composer: { minHeight: 47, flexDirection: "row", alignItems: "flex-end", gap: 9, padding: 6, paddingLeft: 12, borderWidth: 1, borderColor: Colors.border, borderRadius: 12, backgroundColor: Colors.background },
  input: { flex: 1, minHeight: 34, maxHeight: 100, paddingVertical: 7, paddingHorizontal: 0, color: Colors.textPrimary, fontFamily: "Inter_400Regular", fontSize: 10, lineHeight: 16 },
  sendButton: { width: 34, height: 34, alignItems: "center", justifyContent: "center", borderRadius: 10, backgroundColor: Colors.primary },
  sendDisabled: { backgroundColor: Colors.surfaceElevated, borderWidth: 1, borderColor: Colors.border },
  pressed: { opacity: 0.76 },
  composerMeta: { flexDirection: "row", justifyContent: "space-between", gap: 10, paddingHorizontal: 3, paddingTop: 6 },
  composerHint: { color: Colors.textMuted, fontFamily: "Inter_400Regular", fontSize: 7 },
  composerCount: { color: Colors.textMuted, fontFamily: "Inter_400Regular", fontSize: 7 },
  sidePanel: { width: 235, paddingTop: 18 },
  sideHeading: { color: Colors.textMuted, fontFamily: "Inter_700Bold", fontSize: 7, letterSpacing: 1.3, marginBottom: 10 },
  fact: { paddingVertical: 14, borderTopWidth: 1, borderTopColor: Colors.border },
  lastFact: { borderBottomWidth: 1, borderBottomColor: Colors.border },
  factHeader: { flexDirection: "row", alignItems: "center", gap: 7 },
  factTitle: { color: Colors.textSecondary, fontFamily: "Inter_600SemiBold", fontSize: 9 },
  factMetric: { color: Colors.textPrimary, fontFamily: "Georgia", fontSize: 21, marginTop: 9, marginBottom: 5 },
  factCopy: { color: Colors.textSecondary, fontFamily: "Inter_400Regular", fontSize: 8, lineHeight: 14 },
  publicCount: { flexDirection: "row", alignItems: "baseline", gap: 7, marginVertical: 9 },
  publicNumber: { color: Colors.primary, fontFamily: "Georgia", fontSize: 29 },
  publicLabel: { color: Colors.textSecondary, fontFamily: "Inter_500Medium", fontSize: 8 },
  sideFoot: { color: Colors.textMuted, fontFamily: "Inter_400Regular", fontSize: 7, lineHeight: 14, marginTop: 13 },
  mobileFoot: { paddingHorizontal: 14, paddingVertical: 8, borderTopWidth: 1, borderTopColor: Colors.border, backgroundColor: Colors.surface },
  mobileFootText: { color: Colors.textMuted, fontFamily: "Inter_400Regular", fontSize: 7, textAlign: "center" },
});
