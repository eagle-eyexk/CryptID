import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import Colors from "@/constants/colors";
import { useAuth } from "@/context/auth";
import { useChats } from "@/context/chats";

export default function NewChatScreen() {
  const { user } = useAuth();
  const { createConversation } = useChats();
  const [name, setName] = useState("");
  const [alias, setAlias] = useState(user?.username ?? "");
  const valid = name.trim().length > 0;

  function createLocalChannel() {
    if (!valid) return;
    const id = createConversation(name.trim(), alias.trim() || user?.username || "You");
    router.replace({ pathname: "/chat/[id]", params: { id } });
  }

  return (
    <View style={styles.page}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <View style={styles.topline}>
            <Pressable accessibilityRole="button" accessibilityLabel="Go back" style={styles.back} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={17} color={Colors.textPrimary} />
            </Pressable>
            <Text style={styles.topLabel}>NEW LOCAL CHANNEL</Text>
            <Text style={styles.step}>01 / 01</Text>
          </View>
          <View style={styles.intro}>
            <View style={styles.mark}><Ionicons name="chatbubble-ellipses-outline" size={20} color={Colors.primary} /></View>
            <Text style={styles.title}>Name this moment.</Text>
            <Text style={styles.copy}>Create a temporary channel in this browser. Account access is shared; this channel is not.</Text>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>CHANNEL NAME</Text>
            <TextInput
              accessibilityLabel="Channel name"
              autoFocus
              maxLength={30}
              onChangeText={setName}
              onSubmitEditing={createLocalChannel}
              placeholder="A name to recognize this room"
              placeholderTextColor={Colors.textMuted}
              returnKeyType="next"
              style={styles.input}
              value={name}
            />
            <Text style={styles.hint}>{name.length}/30</Text>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>YOUR LOCAL ALIAS</Text>
            <TextInput
              accessibilityLabel="Local alias"
              maxLength={30}
              onChangeText={setAlias}
              onSubmitEditing={createLocalChannel}
              placeholder="How you label yourself here"
              placeholderTextColor={Colors.textMuted}
              returnKeyType="go"
              style={styles.input}
              value={alias}
            />
            <Text style={styles.hint}>This label remains in this browser runtime only.</Text>
          </View>

          <View style={styles.notice}>
            <Ionicons name="information-circle-outline" size={17} color={Colors.accent} />
            <View style={styles.noticeCopy}>
              <Text style={styles.noticeTitle}>A local preview, not a message service</Text>
              <Text style={styles.noticeText}>Messages are not delivered to another person and are not end-to-end encrypted. A preview disappears around 1.2 seconds after it first appears.</Text>
            </View>
          </View>

          <Pressable
            accessibilityRole="button"
            disabled={!valid}
            onPress={createLocalChannel}
            style={({ pressed }) => [styles.create, !valid && styles.createDisabled, pressed && valid && styles.pressed]}
          >
            <Text style={[styles.createText, !valid && styles.createTextDisabled]}>Open local channel</Text>
            <Ionicons name="arrow-forward" size={16} color={valid ? Colors.surface : Colors.textMuted} />
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: Colors.background },
  scroll: { flexGrow: 1, justifyContent: "center", alignItems: "center", padding: 22 },
  card: { width: "100%", maxWidth: 590, padding: 27, borderWidth: 1, borderColor: Colors.border, borderRadius: 16, backgroundColor: Colors.surface },
  topline: { flexDirection: "row", alignItems: "center", gap: 12, paddingBottom: 22, borderBottomWidth: 1, borderBottomColor: Colors.border },
  back: { width: 34, height: 34, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: Colors.border, borderRadius: 10 },
  topLabel: { flex: 1, color: Colors.primary, fontFamily: "Inter_700Bold", fontSize: 8, letterSpacing: 1.5 },
  step: { color: Colors.textMuted, fontFamily: "Inter_500Medium", fontSize: 8 },
  intro: { marginTop: 25, marginBottom: 23 },
  mark: { width: 42, height: 42, alignItems: "center", justifyContent: "center", backgroundColor: Colors.surfaceHigh, borderWidth: 1, borderColor: Colors.border, borderRadius: 14, marginBottom: 13 },
  title: { color: Colors.textPrimary, fontFamily: "Georgia", fontSize: 29, letterSpacing: -0.5 },
  copy: { maxWidth: 420, color: Colors.textSecondary, fontFamily: "Inter_400Regular", fontSize: 11, lineHeight: 18, marginTop: 8 },
  field: { gap: 7, marginBottom: 16 },
  label: { color: Colors.textPrimary, fontFamily: "Inter_700Bold", fontSize: 8, letterSpacing: 1.2 },
  input: { height: 46, borderWidth: 1, borderColor: Colors.border, borderRadius: 9, backgroundColor: Colors.background, paddingHorizontal: 12, color: Colors.textPrimary, fontFamily: "Inter_400Regular", fontSize: 11 },
  hint: { color: Colors.textMuted, fontFamily: "Inter_400Regular", fontSize: 8, lineHeight: 13 },
  notice: { flexDirection: "row", alignItems: "flex-start", gap: 10, padding: 12, borderWidth: 1, borderColor: "#E1CFC5", borderRadius: 10, backgroundColor: "#F7EFE8", marginTop: 3 },
  noticeCopy: { flex: 1, gap: 4 },
  noticeTitle: { color: "#664438", fontFamily: "Inter_600SemiBold", fontSize: 9 },
  noticeText: { color: "#6D544B", fontFamily: "Inter_400Regular", fontSize: 8, lineHeight: 14 },
  create: { minHeight: 45, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, backgroundColor: Colors.primary, borderRadius: 9, marginTop: 19 },
  createDisabled: { backgroundColor: Colors.surfaceElevated, borderWidth: 1, borderColor: Colors.border },
  createText: { color: Colors.surface, fontFamily: "Inter_600SemiBold", fontSize: 10 },
  createTextDisabled: { color: Colors.textMuted },
  pressed: { opacity: 0.78 },
});
