import React, { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import { useAuth } from "@/context/auth";
import { useChats } from "@/context/chats";
import { apiFetch } from "@/utils/api";

type GhostStatus = "loading" | "ready" | "unavailable";

function formatDate(value?: string) {
  if (!value) return "Expires 24 hours after sign-in";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Expires 24 hours after sign-in";
  return date.toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function SettingsScreen() {
  const { user, logout } = useAuth();
  const { conversations, clearAllMessages } = useChats();
  const [ghostStatus, setGhostStatus] = useState<GhostStatus>("loading");
  const [publicDetails, setPublicDetails] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const previewCount = conversations.reduce((sum, channel) => sum + channel.messages.length, 0);

  useEffect(() => {
    let active = true;
    apiFetch("/api/security/ghost-log")
      .then(async (response) => {
        if (!response.ok) throw new Error("Public status unavailable.");
        const data = (await response.json()) as { publicDetails?: unknown };
        if (!active) return;
        if (data.publicDetails !== 0) throw new Error("Unexpected public status.");
        setPublicDetails(0);
        setGhostStatus("ready");
      })
      .catch(() => {
        if (active) setGhostStatus("unavailable");
      });
    return () => { active = false; };
  }, []);

  async function handleLogout() {
    if (typeof window !== "undefined" && !window.confirm("Sign out of this browser? Your account will remain available on your other devices.")) {
      return;
    }
    setBusy(true);
    setNotice("");
    try {
      clearAllMessages();
      await logout();
    } catch {
      setNotice("The server could not confirm sign out. Your session is still active; please try again.");
    } finally {
      setBusy(false);
    }
  }

  function handleClearLocal() {
    if (typeof window !== "undefined" && window.confirm("Clear all channel names and temporary previews from this browser? Your account and other devices will not be affected.")) {
      clearAllMessages();
      setNotice("Local channels cleared.");
    }
  }

  return (
    <View style={styles.page}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.eyebrowRow}><View style={styles.greenDot} /><Text style={styles.eyebrow}>ACCOUNT & PRIVACY</Text></View>
          <Text style={styles.title}>Your access, clearly defined.</Text>
          <Text style={styles.subtitle}>The account lasts. Each individual login does not.</Text>

          <View style={styles.accountCard}>
            <View style={styles.accountMark}><Ionicons name="person-outline" size={18} color={Colors.primary} /></View>
            <View style={styles.accountCopy}>
              <Text style={styles.cardEyebrow}>SHARED ACCOUNT</Text>
              <Text style={styles.username}>{user?.username ?? "Account"}</Text>
              <Text style={styles.accountHint}>Use this username to sign in on another device.</Text>
            </View>
            <View style={styles.accountState}><View style={styles.greenDot} /><Text style={styles.accountStateText}>ACTIVE</Text></View>
          </View>

          <View style={styles.grid}>
            <View style={styles.infoCard}>
              <View style={styles.cardHead}>
                <View style={styles.infoIcon}><Ionicons name="time-outline" size={16} color={Colors.primary} /></View>
                <Text style={styles.cardEyebrow}>LOGIN SESSION</Text>
              </View>
              <Text style={styles.metric}>24 hours</Text>
              <Text style={styles.cardText}>This login ends at the server-enforced expiry time below. It does not delete the account.</Text>
              <View style={styles.valueRow}><Text style={styles.valueLabel}>Expires</Text><Text style={styles.valueText}>{formatDate(user?.sessionExpiresAt)}</Text></View>
            </View>

            <View style={styles.infoCard}>
              <View style={styles.cardHead}>
                <View style={[styles.infoIcon, styles.accentIcon]}><Ionicons name="eye-off-outline" size={16} color={Colors.accent} /></View>
                <Text style={styles.cardEyebrow}>PUBLIC GHOST LOG</Text>
              </View>
              <View style={styles.publicValue}>
                <Text style={styles.publicNumber}>{ghostStatus === "ready" ? publicDetails : "—"}</Text>
                <Text style={styles.publicLabel}>public details</Text>
              </View>
              <Text style={styles.cardText}>
                {ghostStatus === "ready" ? "The public response contains exactly 0 details." : ghostStatus === "loading" ? "Checking the public status endpoint…" : "The public status endpoint is temporarily unavailable; no count is shown."}
              </Text>
              <View style={styles.privateNote}>
                <Text style={styles.privateNoteTitle}>Private security records</Text>
                <Text style={styles.privateNoteText}>Fixed authentication event codes and an internal account ID are retained for up to 14 days. No message contents, raw usernames, credentials, or IP addresses.</Text>
              </View>
            </View>
          </View>

          <View style={styles.infoCard}>
            <View style={styles.cardHead}>
              <View style={styles.infoIcon}><Ionicons name="chatbubble-ellipses-outline" size={16} color={Colors.primary} /></View>
              <Text style={styles.cardEyebrow}>LOCAL CHAT PREVIEWS</Text>
            </View>
            <View style={styles.statsRow}>
              <View><Text style={styles.metric}>{conversations.length}</Text><Text style={styles.statLabel}>CHANNELS IN THIS BROWSER</Text></View>
              <View style={styles.statsRule} />
              <View><Text style={styles.metric}>{previewCount}</Text><Text style={styles.statLabel}>VISIBLE PREVIEWS</Text></View>
            </View>
            <Text style={styles.cardText}>Channels and messages are not synced to the account backend. Message previews stay in this browser runtime and are not delivered or end-to-end encrypted.</Text>
            <View style={styles.valueRow}><Text style={styles.valueLabel}>Message lifetime</Text><Text style={styles.valueText}>About 1.2 seconds after first view</Text></View>
          </View>

          <Text style={styles.sectionLabel}>DEVICE ACTIONS</Text>
          <View style={styles.actionCard}>
            <Pressable accessibilityRole="button" onPress={handleClearLocal} style={({ pressed }) => [styles.actionRow, pressed && styles.pressed]}>
              <View style={styles.actionIcon}><Ionicons name="trash-outline" size={16} color={Colors.accent} /></View>
              <View style={styles.actionCopy}>
                <Text style={styles.actionTitle}>Clear local channels</Text>
                <Text style={styles.actionDescription}>Only affects this browser; the account remains.</Text>
              </View>
              <Ionicons name="chevron-forward" size={15} color={Colors.textMuted} />
            </Pressable>
            <View style={styles.divider} />
            <Pressable accessibilityRole="button" disabled={busy} onPress={() => void handleLogout()} style={({ pressed }) => [styles.actionRow, pressed && styles.pressed, busy && styles.disabled]}>
              <View style={styles.actionIcon}><Ionicons name="log-out-outline" size={16} color={Colors.primary} /></View>
              <View style={styles.actionCopy}>
                <Text style={styles.actionTitle}>Sign out this device</Text>
                <Text style={styles.actionDescription}>Revokes this session, not your account or other devices.</Text>
              </View>
              {busy ? <ActivityIndicator size="small" color={Colors.primary} /> : <Ionicons name="chevron-forward" size={15} color={Colors.textMuted} />}
            </Pressable>
          </View>
          {notice ? <Text accessibilityRole="text" style={styles.notice}>{notice}</Text> : null}
          <Text style={styles.footer}>CryptID · Account access is shared; chat previews are not.</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: Colors.background },
  scroll: { flexGrow: 1, alignItems: "center", paddingHorizontal: 30, paddingTop: 42, paddingBottom: 52 },
  content: { width: "100%", maxWidth: 920 },
  eyebrowRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 13 },
  greenDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.green },
  eyebrow: { color: Colors.primary, fontFamily: "Inter_700Bold", fontSize: 8, letterSpacing: 1.7 },
  title: { color: Colors.textPrimary, fontFamily: "Georgia", fontSize: 36, lineHeight: 42, letterSpacing: -1 },
  subtitle: { color: Colors.textSecondary, fontFamily: "Inter_400Regular", fontSize: 11, marginTop: 9, marginBottom: 24 },
  accountCard: { flexDirection: "row", alignItems: "center", gap: 14, padding: 17, borderWidth: 1, borderColor: Colors.border, borderRadius: 13, backgroundColor: Colors.surface, marginBottom: 13 },
  accountMark: { width: 42, height: 42, borderRadius: 14, alignItems: "center", justifyContent: "center", backgroundColor: Colors.surfaceHigh, borderWidth: 1, borderColor: Colors.border },
  accountCopy: { flex: 1, gap: 4 },
  cardEyebrow: { color: Colors.textMuted, fontFamily: "Inter_700Bold", fontSize: 7, letterSpacing: 1.3 },
  username: { color: Colors.textPrimary, fontFamily: "Inter_600SemiBold", fontSize: 16 },
  accountHint: { color: Colors.textMuted, fontFamily: "Inter_400Regular", fontSize: 9 },
  accountState: { flexDirection: "row", alignItems: "center", gap: 6 },
  accountStateText: { color: Colors.green, fontFamily: "Inter_700Bold", fontSize: 7, letterSpacing: 1 },
  grid: { flexDirection: "row", alignItems: "stretch", gap: 13, marginBottom: 13 },
  infoCard: { flex: 1, padding: 17, borderWidth: 1, borderColor: Colors.border, borderRadius: 13, backgroundColor: Colors.surface, marginBottom: 13 },
  cardHead: { flexDirection: "row", alignItems: "center", gap: 9 },
  infoIcon: { width: 29, height: 29, borderRadius: 9, alignItems: "center", justifyContent: "center", backgroundColor: Colors.surfaceHigh },
  accentIcon: { backgroundColor: Colors.accentGlow },
  metric: { color: Colors.textPrimary, fontFamily: "Georgia", fontSize: 25, marginTop: 13 },
  cardText: { color: Colors.textSecondary, fontFamily: "Inter_400Regular", fontSize: 9, lineHeight: 15, marginTop: 8 },
  valueRow: { flexDirection: "row", justifyContent: "space-between", gap: 10, paddingTop: 11, marginTop: 12, borderTopWidth: 1, borderTopColor: Colors.border },
  valueLabel: { color: Colors.textMuted, fontFamily: "Inter_500Medium", fontSize: 8 },
  valueText: { color: Colors.textSecondary, fontFamily: "Inter_500Medium", fontSize: 8, textAlign: "right", flexShrink: 1 },
  publicValue: { flexDirection: "row", alignItems: "baseline", gap: 8, marginTop: 12 },
  publicNumber: { color: Colors.primary, fontFamily: "Georgia", fontSize: 31 },
  publicLabel: { color: Colors.textSecondary, fontFamily: "Inter_500Medium", fontSize: 9 },
  privateNote: { padding: 11, marginTop: 12, borderWidth: 1, borderColor: "#E1CFC5", borderRadius: 9, backgroundColor: "#F7EFE8" },
  privateNoteTitle: { color: "#664438", fontFamily: "Inter_600SemiBold", fontSize: 9 },
  privateNoteText: { color: "#6D544B", fontFamily: "Inter_400Regular", fontSize: 8, lineHeight: 14, marginTop: 4 },
  statsRow: { flexDirection: "row", alignItems: "center", gap: 22, marginTop: 14 },
  statsRule: { width: 1, height: 34, backgroundColor: Colors.border },
  statLabel: { color: Colors.textMuted, fontFamily: "Inter_600SemiBold", fontSize: 7, letterSpacing: 0.8, marginTop: 2 },
  sectionLabel: { color: Colors.textMuted, fontFamily: "Inter_700Bold", fontSize: 7, letterSpacing: 1.4, marginTop: 15, marginBottom: 8, marginLeft: 3 },
  actionCard: { borderWidth: 1, borderColor: Colors.border, borderRadius: 12, backgroundColor: Colors.surface, overflow: "hidden" },
  actionRow: { minHeight: 65, flexDirection: "row", alignItems: "center", gap: 11, paddingHorizontal: 13, paddingVertical: 10 },
  actionIcon: { width: 31, height: 31, borderRadius: 9, alignItems: "center", justifyContent: "center", backgroundColor: Colors.surfaceHigh },
  actionCopy: { flex: 1, gap: 4 },
  actionTitle: { color: Colors.textPrimary, fontFamily: "Inter_600SemiBold", fontSize: 10 },
  actionDescription: { color: Colors.textMuted, fontFamily: "Inter_400Regular", fontSize: 8 },
  divider: { height: 1, marginLeft: 55, backgroundColor: Colors.border },
  pressed: { backgroundColor: Colors.surfaceHigh },
  disabled: { opacity: 0.6 },
  notice: { color: Colors.accent, fontFamily: "Inter_500Medium", fontSize: 9, marginTop: 10 },
  footer: { color: Colors.textMuted, fontFamily: "Inter_400Regular", fontSize: 8, textAlign: "center", marginTop: 27 },
});
