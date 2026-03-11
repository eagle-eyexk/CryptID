import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  Pressable,
  Platform,
  Alert,
} from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, router } from "expo-router";
import Colors from "@/constants/colors";
import { useChats, Message, BURN_LABELS } from "@/context/chats";

function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function getBurnLabel(expiresAt: number | null): string {
  if (!expiresAt) return "";
  const remaining = Math.max(0, expiresAt - Date.now());
  const secs = Math.floor(remaining / 1000);
  if (secs < 60) return `${secs}s`;
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  return `${hrs}h`;
}

function MessageBubble({ message }: { message: Message }) {
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    if (!message.expiresAt) return;
    const interval = setInterval(() => {
      forceUpdate((n) => n + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [message.expiresAt]);

  const burnLabel = getBurnLabel(message.expiresAt);
  const isMe = message.fromMe;
  const isExpiring = message.expiresAt
    ? message.expiresAt - Date.now() < 30_000
    : false;

  return (
    <View style={[styles.msgRow, isMe ? styles.msgRowMe : styles.msgRowThem]}>
      <View
        style={[
          styles.bubble,
          isMe ? styles.bubbleMe : styles.bubbleThem,
          isExpiring && styles.bubbleExpiring,
        ]}
      >
        <Text style={[styles.msgText, isMe ? styles.msgTextMe : styles.msgTextThem]}>
          {message.text}
        </Text>
        <View style={styles.msgMeta}>
          <Text style={[styles.msgTime, isMe ? styles.msgTimeMe : styles.msgTimeThem]}>
            {formatTime(message.timestamp)}
          </Text>
          {burnLabel ? (
            <View style={styles.burnPill}>
              <Ionicons
                name="flame"
                size={9}
                color={isExpiring ? Colors.danger : Colors.textMuted}
              />
              <Text
                style={[
                  styles.burnPillText,
                  isExpiring && styles.burnPillExpiring,
                ]}
              >
                {burnLabel}
              </Text>
            </View>
          ) : null}
        </View>
      </View>
    </View>
  );
}

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { getConversation, sendMessage, burnAllMessages, deleteConversation } =
    useChats();
  const inputRef = useRef<TextInput>(null);
  const [text, setText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [, forceUpdate] = useState(0);

  const conversation = getConversation(id);

  // Refresh every second to update burn timers
  useEffect(() => {
    const interval = setInterval(() => forceUpdate((n) => n + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSend = useCallback(async () => {
    const trimmed = text.trim();
    if (!trimmed || isSending) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsSending(true);
    setText("");
    await sendMessage(id, trimmed);
    setIsSending(false);
    inputRef.current?.focus();
  }, [text, isSending, id, sendMessage]);

  const handleBurnAll = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      "Burn All Messages",
      "Permanently destroy all messages in this channel?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Burn",
          style: "destructive",
          onPress: () => burnAllMessages(id),
        },
      ]
    );
  };

  const handleDeleteChannel = () => {
    Alert.alert(
      "Delete Channel",
      "Remove this channel and all messages permanently?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            deleteConversation(id);
            router.back();
          },
        },
      ]
    );
  };

  if (!conversation) {
    return (
      <View style={styles.notFound}>
        <Text style={styles.notFoundText}>Channel not found</Text>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backLink}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  const messages = conversation.messages;
  const reversed = [...messages].reverse();

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior="padding"
      keyboardVerticalOffset={0}
    >
      {/* Header */}
      <View
        style={[
          styles.header,
          { paddingTop: (Platform.OS === "web" ? 67 : insets.top) + 8 },
        ]}
      >
        <Pressable
          style={({ pressed }) => [styles.backBtn, { opacity: pressed ? 0.7 : 1 }]}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={20} color={Colors.textPrimary} />
        </Pressable>

        <View style={styles.headerCenter}>
          <View style={styles.headerAvatar}>
            <Text style={styles.headerAvatarText}>
              {conversation.name.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View>
            <Text style={styles.headerName}>{conversation.name}</Text>
            <View style={styles.headerStatus}>
              <View style={styles.headerStatusDot} />
              <Text style={styles.headerStatusText}>
                {conversation.burnTimer === -1
                  ? "No burn"
                  : `Burns in ${BURN_LABELS[conversation.burnTimer]}`}
              </Text>
            </View>
          </View>
        </View>

        <Pressable
          style={({ pressed }) => [styles.menuBtn, { opacity: pressed ? 0.7 : 1 }]}
          onPress={() =>
            Alert.alert("Channel Options", undefined, [
              {
                text: "Burn All Messages",
                style: "destructive",
                onPress: handleBurnAll,
              },
              {
                text: "Delete Channel",
                style: "destructive",
                onPress: handleDeleteChannel,
              },
              { text: "Cancel", style: "cancel" },
            ])
          }
        >
          <Ionicons
            name="ellipsis-horizontal"
            size={20}
            color={Colors.textPrimary}
          />
        </Pressable>
      </View>

      {/* Messages */}
      <FlatList
        inverted
        data={reversed}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesList}
        showsVerticalScrollIndicator={false}
        keyboardDismissMode="interactive"
        keyboardShouldPersistTaps="handled"
        scrollEnabled={!!messages.length}
        renderItem={({ item }) => <MessageBubble message={item} />}
        ListEmptyComponent={
          <View style={styles.emptyChat}>
            <Ionicons name="lock-closed" size={24} color={Colors.textMuted} />
            <Text style={styles.emptyChatText}>
              Channel is secure. Send a message.
            </Text>
            {conversation.burnTimer !== -1 && (
              <Text style={styles.emptyChatSub}>
                Messages burn after {BURN_LABELS[conversation.burnTimer]}
              </Text>
            )}
          </View>
        }
      />

      {/* Input */}
      <View
        style={[
          styles.inputBar,
          { paddingBottom: (Platform.OS === "web" ? 34 : insets.bottom) + 8 },
        ]}
      >
        <View style={styles.inputBox}>
          <TextInput
            ref={inputRef}
            style={styles.input}
            placeholder="Encrypted message..."
            placeholderTextColor={Colors.textMuted}
            value={text}
            onChangeText={setText}
            multiline
            maxLength={500}
            returnKeyType="default"
            onSubmitEditing={Platform.OS === "web" ? handleSend : undefined}
          />
        </View>
        <Pressable
          style={({ pressed }) => [
            styles.sendBtn,
            (!text.trim() || isSending) && styles.sendBtnDisabled,
            { opacity: pressed && !!text.trim() ? 0.8 : 1 },
          ]}
          onPress={handleSend}
          disabled={!text.trim() || isSending}
        >
          <Ionicons
            name="arrow-up"
            size={20}
            color={
              text.trim() && !isSending ? Colors.background : Colors.textMuted
            }
          />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
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
    fontSize: 16,
    color: Colors.textSecondary,
    fontFamily: "Inter_500Medium",
  },
  backLink: {
    fontSize: 15,
    color: Colors.primary,
    fontFamily: "Inter_500Medium",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  headerCenter: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  headerAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.surfaceHigh,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  headerAvatarText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.primary,
    fontFamily: "Inter_600SemiBold",
  },
  headerName: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.textPrimary,
    fontFamily: "Inter_600SemiBold",
  },
  headerStatus: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  headerStatusDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: Colors.green,
  },
  headerStatusText: {
    fontSize: 11,
    color: Colors.textMuted,
    fontFamily: "Inter_400Regular",
  },
  menuBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexGrow: 1,
  },
  msgRow: {
    marginBottom: 4,
    flexDirection: "row",
  },
  msgRowMe: {
    justifyContent: "flex-end",
  },
  msgRowThem: {
    justifyContent: "flex-start",
  },
  bubble: {
    maxWidth: "78%",
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 4,
  },
  bubbleMe: {
    backgroundColor: Colors.sent,
    borderWidth: 1,
    borderColor: Colors.sentBorder,
    borderBottomRightRadius: 5,
  },
  bubbleThem: {
    backgroundColor: Colors.received,
    borderWidth: 1,
    borderColor: Colors.receivedBorder,
    borderBottomLeftRadius: 5,
  },
  bubbleExpiring: {
    borderColor: Colors.danger + "60",
  },
  msgText: {
    fontSize: 15,
    lineHeight: 22,
    fontFamily: "Inter_400Regular",
  },
  msgTextMe: {
    color: Colors.textPrimary,
  },
  msgTextThem: {
    color: Colors.textPrimary,
  },
  msgMeta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 5,
  },
  msgTime: {
    fontSize: 10,
    fontFamily: "Inter_400Regular",
  },
  msgTimeMe: {
    color: Colors.textMuted,
  },
  msgTimeThem: {
    color: Colors.textMuted,
  },
  burnPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  burnPillText: {
    fontSize: 10,
    color: Colors.textMuted,
    fontFamily: "Inter_400Regular",
  },
  burnPillExpiring: {
    color: Colors.danger,
  },
  emptyChat: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 60,
  },
  emptyChatText: {
    fontSize: 14,
    color: Colors.textMuted,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
  },
  emptyChatSub: {
    fontSize: 12,
    color: Colors.textMuted,
    fontFamily: "Inter_400Regular",
    opacity: 0.7,
  },
  inputBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    backgroundColor: Colors.background,
  },
  inputBox: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    maxHeight: 120,
  },
  input: {
    fontSize: 15,
    color: Colors.textPrimary,
    fontFamily: "Inter_400Regular",
    lineHeight: 21,
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  sendBtnDisabled: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
});
