import React, { useState, useRef, useEffect, useCallback } from "react";
import { View, Text, StyleSheet, FlatList, TextInput, Pressable, Platform, Alert, useWindowDimensions } from "react-native";
import type { ViewToken, NativeSyntheticEvent, TextInputKeyPressEventData } from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, router } from "expo-router";
import Colors from "@/constants/colors";
import { useChats, Message } from "@/context/chats";

function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
}

function MessageBubble({ message }: { message: Message }) {
  return (
    <View style={[styles.msgRow, message.fromMe ? styles.msgRowMe : styles.msgRowThem]}>
      <View style={[styles.bubble, message.fromMe ? styles.bubbleMe : styles.bubbleThem]}>
        <Text style={styles.msgText}>{message.text}</Text>
        <View style={styles.msgMeta}>
          <Text style={styles.msgTime}>{formatTime(message.timestamp)}</Text>
          <Ionicons name="eye-off-outline" size={11} color={Colors.textMuted} />
        </View>
      </View>
    </View>
  );
}

const VIEWABILITY_CONFIG = { itemVisiblePercentThreshold: 60 };

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const desktop = Platform.OS === "web" && width >= 900;
  const { getConversation, sendMessage, burnAllMessages, deleteConversation, markMessagesSeen } = useChats();
  const inputRef = useRef<TextInput>(null);
  const seenTimers = useRef(new Map<string, ReturnType<typeof setTimeout>>());
  const [text, setText] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const conversation = getConversation(id);

  useEffect(() => () => {
    seenTimers.current.forEach((timer) => clearTimeout(timer));
    seenTimers.current.clear();
  }, []);

  const handleViewableItemsChanged = useCallback(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    viewableItems.forEach((token) => {
      const message = token.item as Message | undefined;
      if (!message || seenTimers.current.has(message.id)) return;
      const timer = setTimeout(() => {
        markMessagesSeen(id, [message.id]);
        seenTimers.current.delete(message.id);
      }, 1200);
      seenTimers.current.set(message.id, timer);
    });
  }, [id, markMessagesSeen]);

  const handleSend = useCallback(async () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setText("");
    await sendMessage(id, trimmed);
    inputRef.current?.focus();
  }, [text, id, sendMessage]);

  const confirmAction = (title: string, message: string, action: () => void, destructiveLabel: string) => {
    setMenuOpen(false);
    if (Platform.OS === "web") {
      if (typeof window !== "undefined" && window.confirm(`${title}\n\n${message}`)) action();
      return;
    }
    Alert.alert(title, message, [
      { text: "Cancel", style: "cancel" },
      { text: destructiveLabel, style: "destructive", onPress: action },
    ]);
  };

  const handleBurnAll = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    confirmAction("Clear messages", "Remove every pending message in this channel from this runtime?", () => { void burnAllMessages(id); }, "Clear");
  };

  const handleDeleteChannel = () => {
    confirmAction("Delete channel", "Remove this channel and its pending messages from the current runtime?", () => {
      void deleteConversation(id);
      router.back();
    }, "Delete");
  };

  const handleKeyPress = (event: NativeSyntheticEvent<TextInputKeyPressEventData>) => {
    const nativeEvent = event.nativeEvent as TextInputKeyPressEventData & { shiftKey?: boolean };
    if (Platform.OS === "web" && nativeEvent.key === "Enter" && !nativeEvent.shiftKey) {
      event.preventDefault();
      void handleSend();
    }
  };

  if (!conversation) {
    return (
      <View style={styles.notFound}>
        <View style={styles.notFoundMark}><Ionicons name="close" size={20} color={Colors.accent} /></View>
        <Text style={styles.notFoundText}>This channel is no longer in memory.</Text>
        <Pressable onPress={() => router.replace("/(tabs)")}>
          <Text style={styles.backLink}>Return to channels</Text>
        </Pressable>
      </View>
    );
  }

  const messages = conversation.messages;
  const reversed = [...messages].reverse();

  return (
    <KeyboardAvoidingView style={styles.container} behavior="padding" keyboardVerticalOffset={0}>
      <View style={[styles.header, { paddingTop: Platform.OS === "web" ? (desktop ? 28 : 12) : insets.top + 8 }]}>
        <View style={styles.headerInner}>
          <Pressable accessibilityRole="button" accessibilityLabel="Back to channels" style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={19} color={Colors.textPrimary} />
          </Pressable>
          <View style={styles.headerCenter}>
            <View style={styles.headerAvatar}><Text style={styles.headerAvatarText}>{conversation.name.charAt(0).toUpperCase()}</Text></View>
            <View style={styles.headerIdentity}>
              <Text style={styles.headerName}>{conversation.name}</Text>
              <View style={styles.headerStatus}><View style={styles.headerStatusDot} /><Text style={styles.headerStatusText}>Local channel · view once</Text></View>
            </View>
          </View>
          <Pressable accessibilityRole="button" accessibilityLabel="Channel options" style={styles.menuBtn} onPress={() => setMenuOpen((open) => !open)}>
            <Ionicons name="ellipsis-horizontal" size={20} color={Colors.textPrimary} />
          </Pressable>
        </View>
        {menuOpen ? (
          <View style={styles.menuPopover}>
            <Pressable style={styles.menuItem} onPress={handleBurnAll}><Ionicons name="eye-off-outline" size={15} color={Colors.textSecondary} /><Text style={styles.menuText}>Clear pending messages</Text></Pressable>
            <Pressable style={styles.menuItem} onPress={handleDeleteChannel}><Ionicons name="trash-outline" size={15} color={Colors.danger} /><Text style={styles.menuDanger}>Delete channel</Text></Pressable>
          </View>
        ) : null}
      </View>

      <View style={styles.chatArea}>
        {desktop ? (
          <View style={styles.noticeStrip}>
            <Ionicons name="information-circle-outline" size={15} color={Colors.primary} />
            <Text style={styles.noticeText}>Messages are local to this runtime. Nothing is delivered to another person.</Text>
            <Text style={styles.expiryLabel}>EXPIRES AFTER VIEW</Text>
          </View>
        ) : null}
        <FlatList
          style={styles.messageList}
          inverted
          data={reversed}
          viewabilityConfig={VIEWABILITY_CONFIG}
          onViewableItemsChanged={handleViewableItemsChanged}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[styles.messagesList, desktop && styles.messagesListDesktop]}
          showsVerticalScrollIndicator={false}
          keyboardDismissMode="interactive"
          keyboardShouldPersistTaps="handled"
          scrollEnabled={!!messages.length}
          renderItem={({ item }) => <MessageBubble message={item} />}
          ListEmptyComponent={
            <View style={styles.emptyChat}>
              <View style={styles.emptyGlyph}><Ionicons name="eye-off-outline" size={22} color={Colors.primary} /></View>
              <Text style={styles.emptyEyebrow}>THIS CHANNEL HAS NO HISTORY</Text>
              <Text style={styles.emptyChatText}>Write something worth the moment.</Text>
              <Text style={styles.emptyChatSub}>Each local message disappears about 1.2 seconds after first becoming visible.</Text>
            </View>
          }
        />
      </View>

      <View style={[styles.inputOuter, { paddingBottom: Platform.OS === "web" ? (desktop ? 22 : 14) : insets.bottom + 8 }]}>
        <View style={styles.inputShell}>
          <View style={styles.inputBox}>
            <TextInput
              ref={inputRef}
              style={styles.input}
              placeholder="Write a message for this moment"
              placeholderTextColor={Colors.textMuted}
              value={text}
              onChangeText={setText}
              multiline
              maxLength={500}
              returnKeyType="default"
              onKeyPress={handleKeyPress}
              accessibilityLabel="Local message"
            />
          </View>
          <Pressable accessibilityRole="button" accessibilityLabel="Send local message" style={({ pressed }) => [styles.sendBtn, !text.trim() && styles.sendBtnDisabled, pressed && !!text.trim() && styles.pressed]} onPress={() => { void handleSend(); }} disabled={!text.trim()}>
            <Ionicons name="arrow-up" size={20} color={text.trim() ? Colors.background : Colors.textMuted} />
          </Pressable>
        </View>
        <Text style={styles.composerNote}>{text.length}/500 <Text style={styles.composerDot}>·</Text> {Platform.OS === "web" ? "Enter to send, Shift+Enter for a line break" : "Local to this session only"}</Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  notFound: { flex: 1, backgroundColor: Colors.background, alignItems: "center", justifyContent: "center", gap: 13, padding: 24 },
  notFoundMark: { width: 46, height: 46, borderRadius: 16, backgroundColor: Colors.dangerGlow, alignItems: "center", justifyContent: "center" },
  notFoundText: { fontSize: 16, color: Colors.textSecondary, fontFamily: "Inter_500Medium", textAlign: "center" },
  backLink: { fontSize: 14, color: Colors.primary, fontFamily: "Inter_600SemiBold", padding: 8 },
  header: { zIndex: 4, paddingHorizontal: 20, paddingBottom: 13, borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  headerInner: { width: "100%", maxWidth: 1000, alignSelf: "center", flexDirection: "row", alignItems: "center", gap: 14 },
  backBtn: { width: 38, height: 38, borderRadius: 12, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, alignItems: "center", justifyContent: "center" },
  headerCenter: { flex: 1, flexDirection: "row", alignItems: "center", gap: 12, minWidth: 0 },
  headerAvatar: { width: 42, height: 42, borderRadius: 14, backgroundColor: Colors.surfaceHigh, borderWidth: 1, borderColor: Colors.border, alignItems: "center", justifyContent: "center" },
  headerAvatarText: { fontSize: 16, fontFamily: "Inter_700Bold", color: Colors.primary },
  headerIdentity: { gap: 4 },
  headerName: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: Colors.textPrimary },
  headerStatus: { flexDirection: "row", alignItems: "center", gap: 6 },
  headerStatusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.primary },
  headerStatusText: { fontSize: 11, color: Colors.textSecondary, fontFamily: "Inter_400Regular" },
  menuBtn: { width: 38, height: 38, alignItems: "center", justifyContent: "center", borderRadius: 12 },
  menuPopover: { position: "absolute", top: 77, right: 22, width: 230, padding: 6, borderRadius: 11, backgroundColor: Colors.surfaceHigh, borderWidth: 1, borderColor: Colors.border, zIndex: 10, elevation: 8 },
  menuItem: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 11, paddingVertical: 12 },
  menuText: { color: Colors.textPrimary, fontFamily: "Inter_500Medium", fontSize: 12 },
  menuDanger: { color: Colors.danger, fontFamily: "Inter_500Medium", fontSize: 12 },
  chatArea: { flex: 1, width: "100%", maxWidth: 1000, alignSelf: "center", minHeight: 0 },
  noticeStrip: { marginTop: 17, paddingHorizontal: 13, paddingVertical: 10, flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.borderLight, borderRadius: 8 },
  noticeText: { flex: 1, color: Colors.textSecondary, fontSize: 11, fontFamily: "Inter_400Regular" },
  expiryLabel: { color: Colors.primary, fontSize: 8, fontFamily: "Inter_700Bold", letterSpacing: 1.2 },
  messageList: { flex: 1 },
  messagesList: { paddingHorizontal: 20, paddingVertical: 18, flexGrow: 1 },
  messagesListDesktop: { paddingHorizontal: 6, paddingVertical: 22 },
  msgRow: { marginBottom: 9, flexDirection: "row" },
  msgRowMe: { justifyContent: "flex-end" },
  msgRowThem: { justifyContent: "flex-start" },
  bubble: { maxWidth: "78%", minWidth: 120, borderRadius: 15, paddingHorizontal: 15, paddingVertical: 11, gap: 8 },
  bubbleMe: { backgroundColor: Colors.sent, borderWidth: 1, borderColor: Colors.sentBorder, borderBottomRightRadius: 4 },
  bubbleThem: { backgroundColor: Colors.received, borderWidth: 1, borderColor: Colors.receivedBorder, borderBottomLeftRadius: 4 },
  msgText: { fontSize: 14, lineHeight: 21, color: Colors.textPrimary, fontFamily: "Inter_400Regular" },
  msgMeta: { flexDirection: "row", justifyContent: "flex-end", alignItems: "center", gap: 5 },
  msgTime: { color: Colors.textMuted, fontSize: 9, fontFamily: "Inter_400Regular" },
  emptyChat: { flex: 1, alignItems: "center", justifyContent: "center", gap: 11, paddingHorizontal: 28, paddingVertical: 80 },
  emptyGlyph: { width: 54, height: 54, borderRadius: 18, alignItems: "center", justifyContent: "center", backgroundColor: Colors.primaryFaint, borderWidth: 1, borderColor: Colors.border },
  emptyEyebrow: { color: Colors.primary, fontSize: 9, fontFamily: "Inter_700Bold", letterSpacing: 1.8, textAlign: "center" },
  emptyChatText: { color: Colors.textPrimary, fontSize: 18, fontFamily: "Inter_500Medium", textAlign: "center" },
  emptyChatSub: { color: Colors.textSecondary, fontSize: 12, lineHeight: 19, fontFamily: "Inter_400Regular", maxWidth: 370, textAlign: "center" },
  inputOuter: { borderTopWidth: 1, borderTopColor: Colors.borderLight, paddingHorizontal: 20, paddingTop: 13 },
  inputShell: { width: "100%", maxWidth: 1000, alignSelf: "center", flexDirection: "row", alignItems: "flex-end", gap: 10 },
  inputBox: { flex: 1, backgroundColor: Colors.surface, borderRadius: 13, paddingHorizontal: 15, paddingVertical: 10, borderWidth: 1, borderColor: Colors.border, maxHeight: 120 },
  input: { fontSize: 14, color: Colors.textPrimary, fontFamily: "Inter_400Regular", lineHeight: 21, minHeight: 23 },
  sendBtn: { width: 42, height: 42, borderRadius: 13, backgroundColor: Colors.primary, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  sendBtnDisabled: { backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border },
  pressed: { opacity: 0.72 },
  composerNote: { width: "100%", maxWidth: 1000, alignSelf: "center", color: Colors.textMuted, fontFamily: "Inter_400Regular", fontSize: 10, marginTop: 7, marginLeft: 3 },
  composerDot: { color: Colors.primary },
});