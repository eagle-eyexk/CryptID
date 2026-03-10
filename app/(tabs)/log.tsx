import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  Pressable,
  Platform,
  Alert,
  KeyboardAvoidingView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import Colors from "@/constants/colors";
import { CRYPTIDS } from "@/constants/data";
import { useSightings } from "@/context/sightings";

type TimeOfDay = "Dawn" | "Day" | "Dusk" | "Night";
const TIME_OPTIONS: TimeOfDay[] = ["Dawn", "Day", "Dusk", "Night"];
const TIME_ICONS: Record<TimeOfDay, keyof typeof Ionicons.glyphMap> = {
  Dawn: "partly-sunny-outline",
  Day: "sunny-outline",
  Dusk: "moon-outline",
  Night: "moon",
};

export default function LogSightingScreen() {
  const insets = useSafeAreaInsets();
  const { addSighting } = useSightings();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const [cryptidId, setCryptidId] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>("Night");
  const [witnessCount, setWitnessCount] = useState("1");
  const [weather, setWeather] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCryptidPicker, setShowCryptidPicker] = useState(false);

  const selectedCryptid = CRYPTIDS.find((c) => c.id === cryptidId);

  const isValid =
    cryptidId && location.trim().length >= 2 && description.trim().length >= 10;

  const handleSubmit = async () => {
    if (!isValid) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsSubmitting(true);

    try {
      await addSighting({
        cryptidId,
        cryptidName: selectedCryptid?.name ?? "",
        date,
        location: location.trim(),
        description: description.trim(),
        weather: weather.trim() || undefined,
        timeOfDay,
        witnessCount: parseInt(witnessCount) || 1,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(
        "Report Submitted",
        "Your sighting has been recorded in the database.",
        [{ text: "View Sightings", onPress: () => router.push("/(tabs)/sightings") }]
      );
      setDescription("");
      setLocation("");
      setWeather("");
      setCryptidId("");
      setWitnessCount("1");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: Colors.background }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: topPad + 12, paddingBottom: bottomPad + 80 },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.eyebrow}>INCIDENT REPORT</Text>
          <Text style={styles.title}>Log Sighting</Text>
          <Text style={styles.subtitle}>
            Submit your encounter to the global database
          </Text>
        </View>

        {/* Cryptid Picker */}
        <View style={styles.section}>
          <Text style={styles.label}>Cryptid Encountered *</Text>
          <Pressable
            style={({ pressed }) => [
              styles.selectBox,
              showCryptidPicker && styles.selectBoxActive,
              { opacity: pressed ? 0.85 : 1 },
            ]}
            onPress={() => setShowCryptidPicker((v) => !v)}
          >
            {selectedCryptid ? (
              <View style={styles.selectedCryptid}>
                <View
                  style={[
                    styles.cryptidDot,
                    { backgroundColor: selectedCryptid.color },
                  ]}
                />
                <Text style={styles.selectBoxText}>{selectedCryptid.name}</Text>
              </View>
            ) : (
              <Text style={styles.selectBoxPlaceholder}>Select a cryptid...</Text>
            )}
            <Ionicons
              name={showCryptidPicker ? "chevron-up" : "chevron-down"}
              size={16}
              color={Colors.textMuted}
            />
          </Pressable>

          {showCryptidPicker && (
            <View style={styles.dropdown}>
              {CRYPTIDS.map((c) => (
                <Pressable
                  key={c.id}
                  style={({ pressed }) => [
                    styles.dropdownItem,
                    cryptidId === c.id && styles.dropdownItemActive,
                    { opacity: pressed ? 0.8 : 1 },
                  ]}
                  onPress={() => {
                    setCryptidId(c.id);
                    setShowCryptidPicker(false);
                    Haptics.selectionAsync();
                  }}
                >
                  <View
                    style={[styles.cryptidDot, { backgroundColor: c.color }]}
                  />
                  <View style={{ flex: 1 }}>
                    <Text
                      style={[
                        styles.dropdownText,
                        cryptidId === c.id && { color: Colors.primary },
                      ]}
                    >
                      {c.name}
                    </Text>
                    <Text style={styles.dropdownSub}>{c.category}</Text>
                  </View>
                  {cryptidId === c.id && (
                    <Ionicons name="checkmark" size={16} color={Colors.primary} />
                  )}
                </Pressable>
              ))}
            </View>
          )}
        </View>

        {/* Location */}
        <View style={styles.section}>
          <Text style={styles.label}>Location *</Text>
          <View style={styles.inputBox}>
            <Ionicons name="location-outline" size={16} color={Colors.textMuted} />
            <TextInput
              style={styles.input}
              placeholder="City, State / Country"
              placeholderTextColor={Colors.textMuted}
              value={location}
              onChangeText={setLocation}
              returnKeyType="next"
            />
          </View>
        </View>

        {/* Date */}
        <View style={styles.section}>
          <Text style={styles.label}>Date of Encounter</Text>
          <View style={styles.inputBox}>
            <Ionicons name="calendar-outline" size={16} color={Colors.textMuted} />
            <TextInput
              style={styles.input}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={Colors.textMuted}
              value={date}
              onChangeText={setDate}
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* Time of Day */}
        <View style={styles.section}>
          <Text style={styles.label}>Time of Day</Text>
          <View style={styles.timeRow}>
            {TIME_OPTIONS.map((t) => (
              <Pressable
                key={t}
                style={[styles.timeChip, timeOfDay === t && styles.timeChipActive]}
                onPress={() => {
                  setTimeOfDay(t);
                  Haptics.selectionAsync();
                }}
              >
                <Ionicons
                  name={TIME_ICONS[t]}
                  size={14}
                  color={timeOfDay === t ? Colors.primary : Colors.textMuted}
                />
                <Text
                  style={[
                    styles.timeChipText,
                    timeOfDay === t && styles.timeChipTextActive,
                  ]}
                >
                  {t}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Witness Count */}
        <View style={styles.section}>
          <Text style={styles.label}>Number of Witnesses</Text>
          <View style={styles.counterRow}>
            <Pressable
              style={styles.counterBtn}
              onPress={() => {
                const v = Math.max(1, parseInt(witnessCount) - 1);
                setWitnessCount(String(v));
                Haptics.selectionAsync();
              }}
            >
              <Ionicons name="remove" size={18} color={Colors.textPrimary} />
            </Pressable>
            <Text style={styles.counterValue}>{witnessCount}</Text>
            <Pressable
              style={styles.counterBtn}
              onPress={() => {
                const v = Math.min(99, parseInt(witnessCount) + 1);
                setWitnessCount(String(v));
                Haptics.selectionAsync();
              }}
            >
              <Ionicons name="add" size={18} color={Colors.textPrimary} />
            </Pressable>
          </View>
        </View>

        {/* Weather */}
        <View style={styles.section}>
          <Text style={styles.label}>Weather Conditions (optional)</Text>
          <View style={styles.inputBox}>
            <Ionicons name="cloud-outline" size={16} color={Colors.textMuted} />
            <TextInput
              style={styles.input}
              placeholder="e.g. Clear night, foggy, heavy rain"
              placeholderTextColor={Colors.textMuted}
              value={weather}
              onChangeText={setWeather}
            />
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.label}>Encounter Description *</Text>
          <View style={[styles.inputBox, styles.textareaBox]}>
            <TextInput
              style={[styles.input, styles.textarea]}
              placeholder="Describe exactly what you saw, heard, or experienced..."
              placeholderTextColor={Colors.textMuted}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={5}
              textAlignVertical="top"
            />
          </View>
          <Text style={styles.charCount}>{description.length} characters</Text>
        </View>

        {/* Submit */}
        <Pressable
          style={({ pressed }) => [
            styles.submitBtn,
            !isValid && styles.submitBtnDisabled,
            { opacity: pressed && isValid ? 0.85 : 1 },
          ]}
          onPress={handleSubmit}
          disabled={!isValid || isSubmitting}
        >
          {isSubmitting ? (
            <Text style={styles.submitText}>Submitting...</Text>
          ) : (
            <>
              <Ionicons
                name="shield-checkmark"
                size={18}
                color={isValid ? Colors.background : Colors.textMuted}
              />
              <Text style={[styles.submitText, !isValid && styles.submitTextDisabled]}>
                Submit Report
              </Text>
            </>
          )}
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: 20,
  },
  header: {
    marginBottom: 28,
  },
  eyebrow: {
    fontSize: 10,
    fontWeight: "600",
    color: Colors.accent,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 2,
    marginBottom: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: Colors.textPrimary,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontFamily: "Inter_400Regular",
  },
  section: {
    marginBottom: 20,
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
    paddingVertical: 13,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: Colors.textPrimary,
    fontFamily: "Inter_400Regular",
  },
  textareaBox: {
    alignItems: "flex-start",
    paddingVertical: 12,
  },
  textarea: {
    minHeight: 100,
  },
  charCount: {
    fontSize: 11,
    color: Colors.textMuted,
    fontFamily: "Inter_400Regular",
    textAlign: "right",
    marginTop: 4,
  },
  selectBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  selectBoxActive: {
    borderColor: Colors.primary + "60",
  },
  selectBoxText: {
    fontSize: 15,
    color: Colors.textPrimary,
    fontFamily: "Inter_500Medium",
  },
  selectBoxPlaceholder: {
    fontSize: 15,
    color: Colors.textMuted,
    fontFamily: "Inter_400Regular",
  },
  selectedCryptid: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  cryptidDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  dropdown: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    marginTop: 6,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: "hidden",
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  dropdownItemActive: {
    backgroundColor: Colors.primaryFaint,
  },
  dropdownText: {
    fontSize: 15,
    color: Colors.textPrimary,
    fontFamily: "Inter_500Medium",
  },
  dropdownSub: {
    fontSize: 11,
    color: Colors.textMuted,
    fontFamily: "Inter_400Regular",
    marginTop: 1,
  },
  timeRow: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  timeChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  timeChipActive: {
    backgroundColor: Colors.primaryGlow,
    borderColor: Colors.primary + "60",
  },
  timeChipText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontFamily: "Inter_500Medium",
  },
  timeChipTextActive: {
    color: Colors.primary,
    fontFamily: "Inter_600SemiBold",
  },
  counterRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  counterBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  counterValue: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.textPrimary,
    fontFamily: "Inter_700Bold",
    minWidth: 40,
    textAlign: "center",
  },
  submitBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    marginTop: 8,
  },
  submitBtnDisabled: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  submitText: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.background,
    fontFamily: "Inter_700Bold",
  },
  submitTextDisabled: {
    color: Colors.textMuted,
  },
});
