import React from "react";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Colors from "@/constants/colors";

export default function NotFoundScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.mark}><Ionicons name="compass-outline" size={25} color={Colors.primary} /></View>
      <Text style={styles.code}>404 / UNMAPPED</Text>
      <Text style={styles.title}>That route isn’t part of this session.</Text>
      <Text style={styles.copy}>The page may have changed, or its local channel may no longer exist in memory.</Text>
      <Pressable accessibilityRole="button" style={({ pressed }) => [styles.button, pressed && styles.pressed]} onPress={() => router.replace("/(tabs)")}>
        <Text style={styles.buttonText}>Return to channels</Text>
        <Ionicons name="arrow-forward" size={16} color={Colors.background} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, alignItems: "center", justifyContent: "center", padding: 28 },
  mark: { width: 62, height: 62, borderRadius: 20, alignItems: "center", justifyContent: "center", backgroundColor: Colors.primaryFaint, borderWidth: 1, borderColor: Colors.border, marginBottom: 21 },
  code: { color: Colors.primary, fontFamily: "Inter_700Bold", fontSize: 9, letterSpacing: 2 },
  title: { color: Colors.textPrimary, fontFamily: "Inter_700Bold", fontSize: 23, letterSpacing: -0.6, textAlign: "center", marginTop: 13, maxWidth: 460 },
  copy: { color: Colors.textSecondary, fontFamily: "Inter_400Regular", fontSize: 13, lineHeight: 20, textAlign: "center", marginTop: 10, maxWidth: 380 },
  button: { flexDirection: "row", gap: 10, alignItems: "center", backgroundColor: Colors.primary, borderRadius: 9, paddingHorizontal: 16, paddingVertical: 12, marginTop: 23 },
  buttonText: { color: Colors.background, fontFamily: "Inter_600SemiBold", fontSize: 12 },
  pressed: { opacity: 0.72 },
});
