import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, Platform, Alert, ActivityIndicator, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";
import { useAuth } from "@/context/auth";
import { useChats } from "@/context/chats";
import DnaHelix from "@/components/DnaHelix";

function SettingRow({
  icon, label, value, onPress, danger,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string;
  onPress?: () => void;
  danger?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole={onPress ? "button" : undefined}
      style={({ pressed }) => [styles.row, pressed && onPress && styles.pressed]}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={[styles.rowIcon, danger && styles.rowIconDanger]}>
        <Ionicons name={icon} size={17} color={danger ? Colors.danger : Colors.primary} />
      </View>
      <Text style={[styles.rowLabel, danger && styles.rowLabelDanger]}>{label}</Text>
      {value ? <Text style={styles.rowValue}>{value}</Text> : null}
      {onPress ? <Ionicons name="chevron-forward" size={15} color={Colors.textMuted} /> : null}
    </Pressable>
  );
}

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const desktop = Platform.OS === "web" && width >= 900;
  const { user, logout, wipeAll } = useAuth();
  const { conversations, clearAllMessages } = useChats();
  const [wipingAll, setWipingAll] = useState(false);
  const totalMessages = conversations.reduce((sum, channel) => sum + channel.messages.length, 0);

  const confirm = (title: string, message: string, action: () => void, destructive = "Continue") => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (Platform.OS === "web") {
      if (typeof window !== "undefined" && window.confirm(`${title}\n\n${message}`)) action();
      return;
    }
    Alert.alert(title, message, [
      { text: "Cancel", style: "cancel" },
      { text: destructive, style: "destructive", onPress: action },
    ]);
  };

  const handleLogout = () => confirm(
    "Sign out of this runtime?",
    "Your active channels and pending messages will be cleared from memory. The identity remains only while this app process is open.",
    () => {
      clearAllMessages();
      void logout();
    },
    "Sign out",
  );

  const handleWipeAll = () => confirm(
    "End session and clear identity?",
    "Remove the current identity and every channel from this runtime. This cannot be undone.",
    async () => {
      setWipingAll(true);
      clearAllMessages();
      await wipeAll();
      setWipingAll(false);
    },
    "Clear session",
  );

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: Platform.OS === "web" ? (desktop ? 58 : 30) : insets.top + 18, paddingBottom: Platform.OS === "web" && !desktop ? 100 : insets.bottom + 38 },
        ]}
      >
        <View style={styles.content}>
          <View style={styles.eyebrowRow}><View style={styles.liveDot} /><Text style={styles.eyebrow}>SESSION CONTROL</Text></View>
          <Text style={styles.title}>Your session,{desktop ? "\nyour terms." : " your terms."}</Text>
          <Text style={styles.subtitle}>Nothing here follows you outside this running app.</Text>

          {user ? (
            <View style={[styles.identityCard, desktop && styles.identityCardWide]}>
              <View style={styles.identityTop}>
                <View style={styles.identityCopy}>
                  <Text style={styles.identityEyebrow}>CURRENT SESSION IDENTITY</Text>
                  <Text style={styles.username}>{user.username}</Text>
                  <Text style={styles.fingerprint}>{user.dnaKey.fingerprint}</Text>
                  <View style={styles.identityStatus}><View style={styles.statusDot} /><Text style={styles.statusText}>Active in this runtime</Text></View>
                </View>
                <DnaHelix colorPairs={user.dnaKey.colorPairs} size="small" speed={5000} />
              </View>
              <View style={styles.dnaBases}>
                {user.dnaKey.bases.map((base, i) => (
                  <View key={`${base}-${i}`} style={[styles.dnaBaseChip, { borderColor: `${user.dnaKey.colorPairs[i % user.dnaKey.colorPairs.length][0]}70` }]}>
                    <Text style={[styles.dnaBaseText, { color: user.dnaKey.colorPairs[i % user.dnaKey.colorPairs.length][0] }]}>{base}</Text>
                  </View>
                ))}
              </View>
              <Text style={styles.identityNote}>This key identifies the local session only. It does not verify a remote person or secure message delivery.</Text>
            </View>
          ) : null}

          <View style={[styles.overviewRow, !desktop && styles.overviewColumn]}>
            <View style={styles.overviewIntro}>
              <Text style={styles.overviewTitle}>A small footprint.</Text>
              <Text style={styles.overviewCopy}>CryptId currently keeps identity, channels, and messages in JavaScript memory only.</Text>
            </View>
            <View style={styles.stats}>
              <View style={styles.stat}><Text style={styles.statNum}>{conversations.length}</Text><Text style={styles.statLabel}>CHANNELS</Text></View>
              <View style={styles.statRule} />
              <View style={styles.stat}><Text style={styles.statNum}>{totalMessages}</Text><Text style={styles.statLabel}>PENDING MESSAGES</Text></View>
            </View>
          </View>

          <Text style={styles.section}>SESSION</Text>
          <View style={styles.card}>
            <SettingRow icon="person-circle-outline" label="Identity" value="Current runtime" />
            <View style={styles.rowSep} />
            <SettingRow icon="save-outline" label="Persistence" value="Memory only" />
            <View style={styles.rowSep} />
            <SettingRow icon="globe-outline" label="Message transport" value="Local only" />
          </View>

          <Text style={styles.section}>MESSAGE LIFETIME</Text>
          <View style={styles.lifetimeCard}>
            <View style={styles.lifetimeGlyph}><Ionicons name="eye-off-outline" size={19} color={Colors.accent} /></View>
            <View style={styles.lifetimeCopy}>
              <Text style={styles.lifetimeTitle}>Visible, then gone.</Text>
              <Text style={styles.lifetimeText}>A message is removed from this local channel around 1.2 seconds after first becoming visible. It is never sent to another user.</Text>
            </View>
            <Text style={styles.timeBadge}>~1.2s</Text>
          </View>

          <Text style={styles.section}>ACTIONS</Text>
          <View style={styles.card}>
            <SettingRow icon="log-out-outline" label="Sign out" value="Keep identity in runtime" onPress={handleLogout} />
            <View style={styles.rowSep} />
            <SettingRow icon="trash-outline" label="End session & clear identity" onPress={wipingAll ? undefined : handleWipeAll} danger />
            {wipingAll ? <ActivityIndicator color={Colors.danger} style={{ paddingVertical: 10 }} /> : null}
          </View>

          <View style={styles.footer}><Text style={styles.footerMark}>CryptId</Text><Text style={styles.footerText}>Quiet by default. Temporary by design.</Text></View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { paddingHorizontal: 24, alignItems: "center", flexGrow: 1 },
  content: { width: "100%", maxWidth: 980 },
  eyebrowRow: { flexDirection: "row", alignItems: "center", gap: 9, marginBottom: 20 },
  liveDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: Colors.primary },
  eyebrow: { fontSize: 10, fontFamily: "Inter_700Bold", color: Colors.primary, letterSpacing: 2.1 },
  title: { color: Colors.textPrimary, fontFamily: "Georgia", fontSize: 37, letterSpacing: -1.5, lineHeight: 43 },
  subtitle: { color: Colors.textSecondary, fontFamily: "Inter_400Regular", fontSize: 14, marginTop: 10, marginBottom: 26 },
  identityCard: { backgroundColor: Colors.surface, borderRadius: 13, borderWidth: 1, borderColor: Colors.border, padding: 18, marginBottom: 15, overflow: "hidden" },
  identityCardWide: { padding: 23 },
  identityTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 14 },
  identityCopy: { flex: 1, gap: 5 },
  identityEyebrow: { color: Colors.textMuted, fontSize: 9, letterSpacing: 1.5, fontFamily: "Inter_700Bold", marginBottom: 3 },
  username: { color: Colors.textPrimary, fontSize: 21, fontFamily: "Inter_700Bold" },
  fingerprint: { color: Colors.primary, fontSize: 13, letterSpacing: 2, fontFamily: "Inter_700Bold" },
  identityStatus: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 3 },
  statusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.primary },
  statusText: { color: Colors.textSecondary, fontSize: 11, fontFamily: "Inter_500Medium" },
  dnaBases: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 17 },
  dnaBaseChip: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 5, borderWidth: 1, backgroundColor: Colors.surfaceElevated },
  dnaBaseText: { fontSize: 10, fontFamily: "Inter_700Bold", letterSpacing: 1.2 },
  identityNote: { color: Colors.textMuted, fontFamily: "Inter_400Regular", fontSize: 11, lineHeight: 17, marginTop: 13 },
  overviewRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 20, paddingVertical: 20, paddingHorizontal: 18, borderRadius: 11, backgroundColor: Colors.surfaceElevated, borderWidth: 1, borderColor: Colors.border, marginBottom: 24 },
  overviewColumn: { flexDirection: "column", alignItems: "flex-start", gap: 16 },
  overviewIntro: { flex: 1 },
  overviewTitle: { color: Colors.textPrimary, fontFamily: "Inter_600SemiBold", fontSize: 14 },
  overviewCopy: { color: Colors.textSecondary, fontFamily: "Inter_400Regular", fontSize: 11, lineHeight: 17, marginTop: 5, maxWidth: 380 },
  stats: { flexDirection: "row", alignItems: "center", gap: 16 },
  stat: { minWidth: 70, gap: 3 },
  statNum: { color: Colors.textPrimary, fontFamily: "Inter_700Bold", fontSize: 22 },
  statLabel: { color: Colors.textMuted, fontFamily: "Inter_600SemiBold", fontSize: 8, letterSpacing: 1 },
  statRule: { width: 1, height: 34, backgroundColor: Colors.border },
  section: { color: Colors.textMuted, fontFamily: "Inter_700Bold", letterSpacing: 1.5, fontSize: 9, marginLeft: 3, marginBottom: 8 },
  card: { backgroundColor: Colors.surface, borderRadius: 11, borderWidth: 1, borderColor: Colors.border, overflow: "hidden", marginBottom: 22 },
  row: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 14, paddingVertical: 12, minHeight: 59 },
  rowIcon: { width: 32, height: 32, borderRadius: 9, backgroundColor: Colors.primaryFaint, alignItems: "center", justifyContent: "center" },
  rowIconDanger: { backgroundColor: Colors.dangerGlow },
  rowLabel: { flex: 1, fontSize: 13, color: Colors.textPrimary, fontFamily: "Inter_500Medium" },
  rowLabelDanger: { color: Colors.danger },
  rowValue: { color: Colors.textSecondary, fontFamily: "Inter_400Regular", fontSize: 11 },
  rowSep: { height: 1, backgroundColor: Colors.borderLight, marginLeft: 58 },
  lifetimeCard: { flexDirection: "row", alignItems: "flex-start", gap: 12, padding: 15, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, borderRadius: 11, marginBottom: 23 },
  lifetimeGlyph: { width: 34, height: 34, alignItems: "center", justifyContent: "center", backgroundColor: Colors.accentGlow, borderRadius: 10 },
  lifetimeCopy: { flex: 1, gap: 4 },
  lifetimeTitle: { color: Colors.textPrimary, fontFamily: "Inter_600SemiBold", fontSize: 12 },
  lifetimeText: { color: Colors.textSecondary, fontFamily: "Inter_400Regular", fontSize: 11, lineHeight: 17 },
  timeBadge: { color: Colors.accent, fontFamily: "Inter_700Bold", fontSize: 11, paddingTop: 3 },
  pressed: { opacity: 0.7 },
  footer: { alignItems: "center", paddingVertical: 8, marginBottom: 5 },
  footerMark: { color: Colors.textSecondary, fontFamily: "Inter_700Bold", fontSize: 12, letterSpacing: 1 },
  footerText: { color: Colors.textMuted, fontFamily: "Inter_400Regular", fontSize: 10, marginTop: 5 },
});