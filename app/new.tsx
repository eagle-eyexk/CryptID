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
import { useChats, BurnTimer, BURN_LABELS } from "@/context/chats";

const BURN_OPTIONS: { value: BurnTimer; icon: keyof typeof Ionicons.glyphMap }[] = [
  { value: 30, icon: "flash" },
  { value: 60, icon: "timer-outline" },
  { value: 300, icon: "time-outline" },
  { value: 3600, icon: "hourglass-outline" },
  { value: 86400, icon: "calendar-outline" },
  { value: -1, icon: "infinite-outline" },
];

export default function NewChatScreen() {
  const insets = useSafeAreaInsets();
  const { createConversation } = useChats();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const [name, setName] = useState("");
  const [alias, setAlias] = useState("");
  const [burnTimer, setBurnTimer] = useState<BurnTimer>(300);

  const isValid = name.trim().length >= 1;

  const handleCreate = () => {
    if (!isValid) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const id = createConversation(
      name.trim(),
      alias.trim() || "Unknown",
      burnTimer
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
            All messages are encrypted and leave no trace
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

        {/* Burn Timer */}
        <View style={styles.section}>
          <View style={styles.labelRow}>
            <Ionicons name="flame" size={14} color={Colors.danger} />
            <Text style={styles.label}>Message Burn Timer</Text>
          </View>
          <Text style={styles.burnDesc}>
            Messages self-destruct after this time from when they're sent
          </Text>
          <View style={styles.burnGrid}>
            {BURN_OPTIONS.map(({ value, icon }) => {
              const active = burnTimer === value;
              return (
                <Pressable
                  key={value}
                  style={({ pressed }) => [
                    styles.burnOption,
                    active && styles.burnOptionActive,
                    { opacity: pressed ? 0.8 : 1 },
                  ]}
                  onPress={() => {
                    setBurnTimer(value);
                    Haptics.selectionAsync();
                  }}
                >
                  <Ionicons
                    name={icon}
                    size={18}
                    color={active ? Colors.danger : Colors.textMuted}
                  />
                  <Text
                    style={[
                      styles.burnLabel,
                      active && styles.burnLabelActive,
                    ]}
                  >
                    {BURN_LABELS[value]}
                  </Text>
                </Pressable>
              );
            })}
          </View>
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
            Open Encrypted Channel
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
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
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
  burnDesc: {
    fontSize: 12,
    color: Colors.textMuted,
    fontFamily: "Inter_400Regular",
    marginBottom: 12,
    lineHeight: 18,
  },
  burnGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  burnOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  burnOptionActive: {
    backgroundColor: Colors.dangerGlow,
    borderColor: Colors.danger + "50",
  },
  burnLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontFamily: "Inter_500Medium",
  },
  burnLabelActive: {
    color: Colors.danger,
    fontFamily: "Inter_600SemiBold",
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
