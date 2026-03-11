import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
  Alert,
  TextInput,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Colors from "@/constants/colors";
import { useAuth } from "@/context/auth";
import { useChats } from "@/context/chats";

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
  const { pin, setPin, lock } = useAuth();
  const { conversations, deleteConversation } = useChats();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const [changingPin, setChangingPin] = useState(false);
  const [currentPin, setCurrentPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [pinError, setPinError] = useState("");

  const handleChangePin = () => {
    if (currentPin !== pin) {
      setPinError("Current passcode is incorrect");
      return;
    }
    if (newPin.length !== 4 || !/^\d{4}$/.test(newPin)) {
      setPinError("New passcode must be 4 digits");
      return;
    }
    if (newPin !== confirmPin) {
      setPinError("Passcodes don't match");
      return;
    }
    setPin(newPin);
    setChangingPin(false);
    setCurrentPin("");
    setNewPin("");
    setConfirmPin("");
    setPinError("");
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert("Passcode Updated", "Your new passcode is active.");
  };

  const handleWipeAll = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    Alert.alert(
      "Wipe All Data",
      "This will permanently destroy all conversations and messages. There is no recovery.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Wipe Everything",
          style: "destructive",
          onPress: async () => {
            for (const conv of conversations) {
              await deleteConversation(conv.id);
            }
            await AsyncStorage.removeItem("cryptid_chats");
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Alert.alert("Data Wiped", "All traces removed.");
          },
        },
      ]
    );
  };

  const totalMessages = conversations.reduce(
    (sum, c) => sum + c.messages.length,
    0
  );

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
            icon="key-outline"
            label="Change Passcode"
            onPress={() => setChangingPin((v) => !v)}
          />
          {changingPin && (
            <View style={styles.pinForm}>
              <TextInput
                style={styles.pinInput}
                placeholder="Current passcode"
                placeholderTextColor={Colors.textMuted}
                value={currentPin}
                onChangeText={setCurrentPin}
                keyboardType="number-pad"
                maxLength={4}
                secureTextEntry
              />
              <TextInput
                style={styles.pinInput}
                placeholder="New 4-digit passcode"
                placeholderTextColor={Colors.textMuted}
                value={newPin}
                onChangeText={setNewPin}
                keyboardType="number-pad"
                maxLength={4}
                secureTextEntry
              />
              <TextInput
                style={styles.pinInput}
                placeholder="Confirm new passcode"
                placeholderTextColor={Colors.textMuted}
                value={confirmPin}
                onChangeText={setConfirmPin}
                keyboardType="number-pad"
                maxLength={4}
                secureTextEntry
              />
              {pinError ? (
                <Text style={styles.pinError}>{pinError}</Text>
              ) : null}
              <View style={styles.pinButtons}>
                <Pressable
                  style={styles.pinCancelBtn}
                  onPress={() => {
                    setChangingPin(false);
                    setCurrentPin("");
                    setNewPin("");
                    setConfirmPin("");
                    setPinError("");
                  }}
                >
                  <Text style={styles.pinCancelText}>Cancel</Text>
                </Pressable>
                <Pressable
                  style={styles.pinSaveBtn}
                  onPress={handleChangePin}
                >
                  <Text style={styles.pinSaveText}>Update</Text>
                </Pressable>
              </View>
            </View>
          )}
          <View style={styles.rowSep} />
          <SettingRow
            icon="lock-closed-outline"
            label="Lock App"
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              lock();
            }}
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
            value="1.0.0"
            rightIcon={undefined}
          />
        </View>

        {/* Danger Zone */}
        <Text style={styles.section}>DANGER ZONE</Text>
        <View style={styles.card}>
          <SettingRow
            icon="flame-outline"
            label="Wipe All Data"
            onPress={handleWipeAll}
            danger
          />
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
  pinForm: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  pinInput: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.textPrimary,
    fontFamily: "Inter_400Regular",
    borderWidth: 1,
    borderColor: Colors.border,
    letterSpacing: 6,
  },
  pinError: {
    fontSize: 12,
    color: Colors.danger,
    fontFamily: "Inter_400Regular",
  },
  pinButtons: {
    flexDirection: "row",
    gap: 10,
    marginTop: 4,
  },
  pinCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: Colors.surfaceElevated,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  pinCancelText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontFamily: "Inter_500Medium",
  },
  pinSaveBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    alignItems: "center",
  },
  pinSaveText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.background,
    fontFamily: "Inter_600SemiBold",
  },
  footer: {
    fontSize: 12,
    color: Colors.textMuted,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    paddingVertical: 8,
  },
});
