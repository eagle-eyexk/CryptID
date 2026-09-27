import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  Platform,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import Colors from "@/constants/colors";
import { useChats } from "@/context/chats";

export default function NewChatScreen() {
  const insets = useSafeAreaInsets();
  const { createConversation } = useChats();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const [name, setName] = useState("");
  const [alias, setAlias] = useState("");

  const isValid = name.trim().length >= 1;

  const handleCreate = () => {
    if (!isValid) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const id = createConversation(
      name.trim(),
      alias.trim() || "Unknown",
    );
    router.replace({ pathname: "/chat/[id]", params: { id } });
  };

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: insets.bottom + 40 },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable
            style={({ pressed }) => [styles.closeBtn, { opacity: pressed ? 0.7 : 1 }]}
            onPress={() => router.back()}
          >
            <Ionicons name="close" size={20} color={Colors.textPrimary} />
          </Pressable>
          <Text style={styles.title}>New Channel</Text>
          <View style={{ width: 36 }} />
        </View>

        {/* Encryption notice */}
        <View style={styles.notice}>
          <Ionicons name="shield-checkmark" size={16} color={Colors.green} />
          <Text style={styles.noticeText}>
            Messages stay in memory only and disappear after one view
          </Text>
        </View>

        {/* Form */}
        <View style={styles.section}>
          <Text style={styles.label}>Contact Name *</Text>
          <View style={styles.inputBox}>
            <Ionicons name="person-outline" size={16} color={Colors.textMuted} />
            <TextInput
              style={styles.input}
              placeholder="e.g. Ghost, Cipher, Alpha..."
              placeholderTextColor={Colors.textMuted}
              value={name}
              onChangeText={setName}
              autoFocus
              returnKeyType="next"
              maxLength={30}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Your Alias (optional)</Text>
          <View style={styles.inputBox}>
            <Ionicons name="at-outline" size={16} color={Colors.textMuted} />
            <TextInput
              style={styles.input}
              placeholder="e.g. Phantom, Shadow..."
              placeholderTextColor={Colors.textMuted}
              value={alias}
              onChangeText={setAlias}
              returnKeyType="done"
              maxLength={30}
            />
          </View>
          <Text style={styles.hint}>Only visible to you</Text>
        </View>

        {/* Create Button */}
        <Pressable
          style={({ pressed }) => [
            styles.createBtn,
            !isValid && styles.createBtnDisabled,
            { opacity: pressed && isValid ? 0.85 : 1 },
          ]}
          onPress={handleCreate}
          disabled={!isValid}
        >
          <Ionicons
            name="lock-closed"
            size={18}
            color={isValid ? Colors.background : Colors.textMuted}
          />
          <Text style={[styles.createText, !isValid && styles.createTextDisabled]}>
            Open View-Once Channel
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 12,
    paddingBottom: 24,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  title: {
    fontSize: 17,
    fontWeight: "600",
    color: Colors.textPrimary,
    fontFamily: "Inter_600SemiBold",
  },
  notice: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: Colors.greenGlow,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    marginBottom: 28,
    borderWidth: 1,
    borderColor: Colors.green + "30",
  },
  noticeText: {
    flex: 1,
    fontSize: 13,
    color: Colors.green,
    fontFamily: "Inter_500Medium",
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.textSecondary,
    fontFamily: "Inter_600SemiBold",
    marginBottom: 8,
    letterSpacing: 0.2,
  },
  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: Colors.textPrimary,
    fontFamily: "Inter_400Regular",
  },
  hint: {
    fontSize: 11,
    color: Colors.textMuted,
    fontFamily: "Inter_400Regular",
    marginTop: 5,
    marginLeft: 4,
  },
  createBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    marginTop: 8,
  },
  createBtnDisabled: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  createText: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.background,
    fontFamily: "Inter_700Bold",
  },
  createTextDisabled: {
    color: Colors.textMuted,
  },
});
