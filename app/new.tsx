import React, { useRef, useState } from "react";
import { View, Text, StyleSheet, TextInput, Pressable, Platform, ScrollView, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import Colors from "@/constants/colors";
import { useChats } from "@/context/chats";

export default function NewChatScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const desktop = Platform.OS === "web" && width >= 760;
  const { createConversation } = useChats();
  const aliasRef = useRef<TextInput>(null);
  const [name, setName] = useState("");
  const [alias, setAlias] = useState("");
  const isValid = name.trim().length >= 1;

  const handleCreate = () => {
    if (!isValid) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const id = createConversation(name.trim(), alias.trim() || "Unknown");
    router.replace({ pathname: "/chat/[id]", params: { id } });
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: Platform.OS === "web" ? (desktop ? 54 : 22) : insets.top + 10, paddingBottom: insets.bottom + 36 },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[styles.card, desktop && styles.cardDesktop]}>
          <View style={styles.topline}>
            <Pressable accessibilityRole="button" accessibilityLabel="Close" style={styles.closeBtn} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={18} color={Colors.textPrimary} />
            </Pressable>
            <Text style={styles.topLabel}>NEW LOCAL CHANNEL</Text>
            <View style={styles.topIndex}><Text style={styles.topIndexText}>01 / 01</Text></View>
          </View>

          <View style={[styles.intro, desktop && styles.introDesktop]}>
            <View style={styles.iconPlate}><Ionicons name="chatbubble-ellipses-outline" size={23} color={Colors.primary} /></View>
            <Text style={styles.title}>Give this moment a name.</Text>
            <Text style={styles.introText}>Create a private channel in this session. It stays on this device and is not delivered to another person.</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.section}>
              <View style={styles.labelRow}><Text style={styles.label}>CHANNEL NAME</Text><Text style={styles.required}>REQUIRED</Text></View>
              <View style={styles.inputBox}>
                <Ionicons name="person-outline" size={16} color={Colors.textSecondary} />
                <TextInput
                  style={styles.input}
                  placeholder="A name to recognize this channel"
                  placeholderTextColor={Colors.textMuted}
                  value={name}
                  onChangeText={setName}
                  autoFocus
                  returnKeyType="next"
                  onSubmitEditing={() => aliasRef.current?.focus()}
                  maxLength={30}
                  accessibilityLabel="Channel name"
                />
                <Text style={styles.charCount}>{name.length}/30</Text>
              </View>
            </View>

            <View style={styles.section}>
              <View style={styles.labelRow}><Text style={styles.label}>YOUR ALIAS</Text><Text style={styles.optional}>OPTIONAL</Text></View>
              <View style={styles.inputBox}>
                <Ionicons name="at-outline" size={16} color={Colors.textSecondary} />
                <TextInput
                  ref={aliasRef}
                  style={styles.input}
                  placeholder="How you’ll label yourself here"
                  placeholderTextColor={Colors.textMuted}
                  value={alias}
                  onChangeText={setAlias}
                  returnKeyType="done"
                  onSubmitEditing={handleCreate}
                  maxLength={30}
                  accessibilityLabel="Your alias"
                />
                <Text style={styles.charCount}>{alias.length}/30</Text>
              </View>
              <Text style={styles.hint}>This label is only kept in the local channel state.</Text>
            </View>

            <View style={styles.transparency}>
              <View style={styles.transparencyIcon}><Ionicons name="hourglass-outline" size={16} color={Colors.accent} /></View>
              <View style={styles.transparencyCopy}>
                <Text style={styles.transparencyTitle}>Temporary by design</Text>
                <Text style={styles.transparencyText}>Messages are held in JavaScript memory and removed about 1.2 seconds after first appearing on screen.</Text>
              </View>
            </View>

            <Pressable
              accessibilityRole="button"
              style={({ pressed }) => [styles.createBtn, !isValid && styles.createBtnDisabled, pressed && isValid && styles.pressed]}
              onPress={handleCreate}
              disabled={!isValid}
            >
              <Text style={[styles.createText, !isValid && styles.createTextDisabled]}>Open channel</Text>
              <Ionicons name="arrow-forward" size={17} color={isValid ? Colors.background : Colors.textMuted} />
            </Pressable>
            <Text style={styles.bottomNote}>No network. No saved history. Only this open session.</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { flexGrow: 1, alignItems: "center", paddingHorizontal: 20 },
  card: { width: "100%", maxWidth: 620 },
  cardDesktop: { backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, borderRadius: 16, padding: 30 },
  topline: { flexDirection: "row", alignItems: "center", gap: 13, marginBottom: 37 },
  closeBtn: { width: 38, height: 38, borderRadius: 11, alignItems: "center", justifyContent: "center", backgroundColor: Colors.surfaceElevated, borderWidth: 1, borderColor: Colors.border },
  topLabel: { flex: 1, fontFamily: "Inter_700Bold", fontSize: 9, letterSpacing: 2, color: Colors.primary },
  topIndex: { borderWidth: 1, borderColor: Colors.border, borderRadius: 5, paddingHorizontal: 8, paddingVertical: 5 },
  topIndexText: { color: Colors.textMuted, fontFamily: "Inter_600SemiBold", fontSize: 9 },
  intro: { marginBottom: 28 },
  introDesktop: { marginBottom: 33 },
  iconPlate: { width: 46, height: 46, borderRadius: 15, backgroundColor: Colors.primaryFaint, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: Colors.border, marginBottom: 17 },
  title: { color: Colors.textPrimary, fontFamily: "Georgia", fontSize: 30, letterSpacing: -1, lineHeight: 37 },
  introText: { color: Colors.textSecondary, fontFamily: "Inter_400Regular", fontSize: 14, lineHeight: 21, maxWidth: 490, marginTop: 10 },
  form: { gap: 22 },
  section: { gap: 9 },
  labelRow: { flexDirection: "row", alignItems: "center", gap: 9 },
  label: { fontSize: 10, fontFamily: "Inter_700Bold", color: Colors.textPrimary, letterSpacing: 1.4 },
  required: { fontSize: 8, color: Colors.accent, fontFamily: "Inter_700Bold", letterSpacing: 1 },
  optional: { fontSize: 8, color: Colors.textMuted, fontFamily: "Inter_600SemiBold", letterSpacing: 1 },
  inputBox: { flexDirection: "row", alignItems: "center", backgroundColor: Colors.surfaceElevated, borderRadius: 9, paddingHorizontal: 13, paddingVertical: 13, gap: 11, borderWidth: 1, borderColor: Colors.border, minHeight: 51 },
  input: { flex: 1, fontSize: 14, color: Colors.textPrimary, fontFamily: "Inter_400Regular", minWidth: 0 },
  charCount: { fontSize: 9, color: Colors.textMuted, fontFamily: "Inter_400Regular" },
  hint: { color: Colors.textMuted, fontFamily: "Inter_400Regular", fontSize: 11, marginLeft: 2 },
  transparency: { flexDirection: "row", gap: 12, padding: 14, borderRadius: 10, backgroundColor: Colors.accentGlow, borderWidth: 1, borderColor: "#FF897C40", alignItems: "flex-start" },
  transparencyIcon: { width: 30, height: 30, borderRadius: 9, backgroundColor: Colors.surface, alignItems: "center", justifyContent: "center" },
  transparencyCopy: { flex: 1, gap: 4 },
  transparencyTitle: { color: Colors.textPrimary, fontFamily: "Inter_600SemiBold", fontSize: 12 },
  transparencyText: { color: Colors.textSecondary, fontFamily: "Inter_400Regular", fontSize: 11, lineHeight: 17 },
  createBtn: { minHeight: 49, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 11, backgroundColor: Colors.primary, borderRadius: 9, paddingHorizontal: 18, marginTop: 2 },
  createBtnDisabled: { backgroundColor: Colors.surfaceElevated, borderWidth: 1, borderColor: Colors.border },
  createText: { fontSize: 13, fontFamily: "Inter_700Bold", color: Colors.background },
  createTextDisabled: { color: Colors.textMuted },
  pressed: { opacity: 0.75 },
  bottomNote: { color: Colors.textMuted, fontFamily: "Inter_400Regular", textAlign: "center", fontSize: 10, marginTop: -12 },
});