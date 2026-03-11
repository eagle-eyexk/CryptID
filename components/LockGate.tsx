import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";
import { useAuth } from "@/context/auth";

const DIGITS = [
  ["1", "2", "3"],
  ["4", "5", "6"],
  ["7", "8", "9"],
  ["", "0", "⌫"],
];

type Props = { children: React.ReactNode };

export function LockGate({ children }: Props) {
  const { isLocked, unlock, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={Colors.primary} />
      </View>
    );
  }

  if (!isLocked) return <>{children}</>;

  return <LockScreen />;
}

function LockScreen() {
  const insets = useSafeAreaInsets();
  const { unlock } = useAuth();
  const [input, setInput] = useState("");
  const [error, setError] = useState(false);
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const topPad = Platform.OS === "web" ? 80 : insets.top;

  useEffect(() => {
    if (input.length === 4) {
      const success = unlock(input);
      if (!success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        setError(true);
        Animated.sequence([
          Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: true }),
          Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
          Animated.timing(shakeAnim, { toValue: 8, duration: 60, useNativeDriver: true }),
          Animated.timing(shakeAnim, { toValue: -8, duration: 60, useNativeDriver: true }),
          Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
        ]).start(() => {
          setInput("");
          setError(false);
        });
      }
    }
  }, [input]);

  const handleDigit = (d: string) => {
    if (d === "⌫") {
      Haptics.selectionAsync();
      setInput((prev) => prev.slice(0, -1));
      return;
    }
    if (!d || input.length >= 4) return;
    Haptics.selectionAsync();
    setInput((prev) => prev + d);
  };

  return (
    <View style={[styles.lock, { paddingTop: topPad, paddingBottom: insets.bottom + 20 }]}>
      {/* Top */}
      <View style={styles.lockTop}>
        <View style={styles.lockIcon}>
          <Ionicons name="lock-closed" size={28} color={Colors.primary} />
        </View>
        <Text style={styles.lockTitle}>CryptId</Text>
        <Text style={styles.lockSub}>Enter passcode to unlock</Text>
      </View>

      {/* Dots */}
      <Animated.View
        style={[styles.dots, { transform: [{ translateX: shakeAnim }] }]}
      >
        {[0, 1, 2, 3].map((i) => (
          <View
            key={i}
            style={[
              styles.dot,
              i < input.length && styles.dotFilled,
              error && styles.dotError,
            ]}
          />
        ))}
      </Animated.View>

      {error ? (
        <Text style={styles.errorText}>Wrong passcode</Text>
      ) : (
        <View style={{ height: 20 }} />
      )}

      {/* Keypad */}
      <View style={styles.keypad}>
        {DIGITS.map((row, ri) => (
          <View key={ri} style={styles.row}>
            {row.map((d, di) => (
              <Pressable
                key={di}
                style={({ pressed }) => [
                  styles.key,
                  !d && styles.keyEmpty,
                  !!d && pressed && styles.keyPressed,
                ]}
                onPress={() => handleDigit(d)}
                disabled={!d}
              >
                {d === "⌫" ? (
                  <Ionicons name="backspace-outline" size={22} color={Colors.textPrimary} />
                ) : (
                  <Text style={styles.keyText}>{d}</Text>
                )}
              </Pressable>
            ))}
          </View>
        ))}
      </View>

      <Text style={styles.hint}>Default: 1234</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  lock: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 32,
  },
  lockTop: {
    alignItems: "center",
    gap: 10,
    paddingTop: 40,
  },
  lockIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.primaryGlow,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.primary + "40",
    marginBottom: 4,
  },
  lockTitle: {
    fontSize: 26,
    fontWeight: "700",
    color: Colors.textPrimary,
    fontFamily: "Inter_700Bold",
    letterSpacing: 1,
  },
  lockSub: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontFamily: "Inter_400Regular",
  },
  dots: {
    flexDirection: "row",
    gap: 18,
    marginVertical: 10,
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: Colors.textMuted,
    backgroundColor: "transparent",
  },
  dotFilled: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  dotError: {
    backgroundColor: Colors.danger,
    borderColor: Colors.danger,
  },
  errorText: {
    fontSize: 13,
    color: Colors.danger,
    fontFamily: "Inter_500Medium",
    height: 20,
  },
  keypad: {
    width: "100%",
    maxWidth: 320,
    gap: 12,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  key: {
    flex: 1,
    height: 68,
    borderRadius: 16,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  keyEmpty: {
    backgroundColor: "transparent",
    borderColor: "transparent",
  },
  keyPressed: {
    backgroundColor: Colors.surfaceHigh,
    borderColor: Colors.primary + "50",
  },
  keyText: {
    fontSize: 24,
    fontWeight: "300",
    color: Colors.textPrimary,
    fontFamily: "Inter_400Regular",
  },
  hint: {
    fontSize: 12,
    color: Colors.textMuted,
    fontFamily: "Inter_400Regular",
    paddingBottom: 8,
  },
});
