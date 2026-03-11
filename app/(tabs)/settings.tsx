import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";
import { useAuth } from "@/context/auth";
import { useChats } from "@/context/chats";
import DnaHelix from "@/components/DnaHelix";

function SettingRow({
  icon,
  label,
  value,
  onPress,
  danger,
  rightIcon,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string;
  onPress?: () => void;
  danger?: boolean;
  rightIcon?: keyof typeof Ionicons.glyphMap;
}) {
  return (
    <Pressable
      style={({ pressed }) => [styles.row, { opacity: pressed ? 0.7 : 1 }]}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={[styles.rowIcon, danger && styles.rowIconDanger]}>
        <Ionicons
          name={icon}
          size={18}
          color={danger ? Colors.danger : Colors.primary}
        />
      </View>
      <Text style={[styles.rowLabel, danger && styles.rowLabelDanger]}>
        {label}
      </Text>
      {value ? <Text style={styles.rowValue}>{value}</Text> : null}
      {rightIcon || onPress ? (
        <Ionicons
          name={rightIcon ?? "chevron-forward"}
          size={16}
          color={Colors.textMuted}
        />
      ) : null}
    </Pressable>
  );
}

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { user, logout, wipeAll } = useAuth();
  const { conversations } = useChats();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const [wipingAll, setWipingAll] = useState(false);

  const totalMessages = conversations.reduce(
    (sum, c) => sum + c.messages.length,
    0
  );

  const handleLogout = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      "Sign Out",
      "Lock this device? Your identity is safe — re-enter your passphrase to unlock.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Sign Out",
          style: "destructive",
          onPress: async () => {
            await logout();
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          },
        },
      ]
    );
  };

  const handleWipeAll = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    Alert.alert(
      "Wipe All Data",
      "This permanently destroys your identity, all conversations and messages. Your DNA identity can only be recovered by re-registering with the same credentials.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Wipe Everything",
          style: "destructive",
          onPress: async () => {
            setWipingAll(true);
            await wipeAll();
            setWipingAll(false);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>CONFIGURATION</Text>
        <Text style={styles.title}>Settings</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: Platform.OS === "web" ? 84 + 24 : insets.bottom + 24 },
        ]}
      >
        {/* DNA Identity Card */}
        {user && (
          <View style={styles.dnaCard}>
            <View style={styles.dnaCardTop}>
              <View style={styles.dnaCardInfo}>
                <Text style={styles.dnaUsername}>{user.username}</Text>
                <Text style={styles.dnaFingerprint}>
                  {user.dnaKey.fingerprint}
                </Text>
                <View style={styles.dnaStatusRow}>
                  <View style={styles.dnaStatusDot} />
                  <Text style={styles.dnaStatusText}>Identity verified</Text>
                </View>
              </View>
              <DnaHelix
                colorPairs={user.dnaKey.colorPairs}
                size="small"
                speed={5000}
              />
            </View>

            <View style={styles.dnaBases}>
              {user.dnaKey.bases.map((base, i) => (
                <View
                  key={i}
                  style={[
                    styles.dnaBaseChip,
                    {
                      borderColor:
                        user.dnaKey.colorPairs[i % user.dnaKey.colorPairs.length][0] + "50",
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.dnaBaseText,
                      {
                        color:
                          user.dnaKey.colorPairs[i % user.dnaKey.colorPairs.length][0],
                      },
                    ]}
                  >
                    {base}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Status Card */}
        <View style={styles.statusCard}>
          <View style={styles.statusRow}>
            <View style={styles.statusLight} />
            <Text style={styles.statusText}>End-to-end encrypted</Text>
          </View>
          <View style={styles.statusStats}>
            <View style={styles.stat}>
              <Text style={styles.statNum}>{conversations.length}</Text>
              <Text style={styles.statLabel}>Channels</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statNum}>{totalMessages}</Text>
              <Text style={styles.statLabel}>Messages</Text>
            </View>
          </View>
        </View>

        {/* Security */}
        <Text style={styles.section}>SECURITY</Text>
        <View style={styles.card}>
          <SettingRow
            icon="log-out-outline"
            label="Sign Out"
            onPress={handleLogout}
          />
          <View style={styles.rowSep} />
          <SettingRow
            icon="shield-checkmark-outline"
            label="Recovery"
            value="Credential-based"
            rightIcon={undefined}
          />
        </View>

        {/* About */}
        <Text style={styles.section}>ABOUT</Text>
        <View style={styles.card}>
          <SettingRow
            icon="shield-checkmark-outline"
            label="Protocol"
            value="AES-256"
            rightIcon={undefined}
          />
          <View style={styles.rowSep} />
          <SettingRow
            icon="eye-off-outline"
            label="No Logs Policy"
            value="Active"
            rightIcon={undefined}
          />
          <View style={styles.rowSep} />
          <SettingRow
            icon="code-slash-outline"
            label="Version"
            value="2.0.0"
            rightIcon={undefined}
          />
        </View>

        {/* Danger Zone */}
        <Text style={styles.section}>DANGER ZONE</Text>
        <View style={styles.card}>
          <SettingRow
            icon="flame-outline"
            label="Wipe All Data"
            onPress={wipingAll ? undefined : handleWipeAll}
            danger
          />
          {wipingAll && (
            <ActivityIndicator
              color={Colors.danger}
              style={{ paddingBottom: 12 }}
            />
          )}
        </View>

        <Text style={styles.footer}>
          CryptId — Zero-knowledge, zero-trace messaging
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 18,
    gap: 4,
  },
  eyebrow: {
    fontSize: 10,
    fontWeight: "700",
    color: Colors.primary,
    fontFamily: "Inter_700Bold",
    letterSpacing: 2.5,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: Colors.textPrimary,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.5,
  },
  scroll: {
    paddingHorizontal: 20,
  },
  dnaCard: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    marginBottom: 16,
    gap: 12,
  },
  dnaCardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dnaCardInfo: {
    flex: 1,
    gap: 4,
  },
  dnaUsername: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.textPrimary,
    fontFamily: "Inter_700Bold",
  },
  dnaFingerprint: {
    fontSize: 13,
    color: Colors.primary,
    fontFamily: "Inter_700Bold",
    letterSpacing: 2,
  },
  dnaStatusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 2,
  },
  dnaStatusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.green,
  },
  dnaStatusText: {
    fontSize: 11,
    color: Colors.green,
    fontFamily: "Inter_500Medium",
  },
  dnaBases: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  dnaBaseChip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    backgroundColor: Colors.surfaceElevated,
  },
  dnaBaseText: {
    fontSize: 11,
    fontFamily: "Inter_700Bold",
    letterSpacing: 1.5,
  },
  statusCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 24,
    gap: 14,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  statusLight: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.green,
  },
  statusText: {
    fontSize: 13,
    color: Colors.green,
    fontFamily: "Inter_600SemiBold",
    fontWeight: "600",
  },
  statusStats: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
  },
  stat: {
    alignItems: "center",
    gap: 2,
  },
  statNum: {
    fontSize: 22,
    fontWeight: "700",
    color: Colors.textPrimary,
    fontFamily: "Inter_700Bold",
  },
  statLabel: {
    fontSize: 11,
    color: Colors.textMuted,
    fontFamily: "Inter_400Regular",
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: Colors.border,
  },
  section: {
    fontSize: 11,
    fontWeight: "600",
    color: Colors.textMuted,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 1.5,
    marginBottom: 8,
    marginLeft: 4,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: "hidden",
    marginBottom: 24,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  rowIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: Colors.primaryGlow,
    alignItems: "center",
    justifyContent: "center",
  },
  rowIconDanger: {
    backgroundColor: Colors.dangerGlow,
  },
  rowLabel: {
    flex: 1,
    fontSize: 15,
    color: Colors.textPrimary,
    fontFamily: "Inter_500Medium",
  },
  rowLabelDanger: {
    color: Colors.danger,
  },
  rowValue: {
    fontSize: 13,
    color: Colors.textMuted,
    fontFamily: "Inter_400Regular",
    marginRight: 4,
  },
  rowSep: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginLeft: 62,
  },
  footer: {
    fontSize: 12,
    color: Colors.textMuted,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    paddingVertical: 8,
  },
});
