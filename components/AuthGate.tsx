import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  Platform,
  Animated as RNAnimated,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useAuth } from "@/context/auth";
import DnaHelix from "@/components/DnaHelix";
import Colors from "@/constants/colors";
import {
  sanitize,
  validateUsername,
  validatePassphrase,
  passphraseStrength,
  STRENGTH_LABELS,
  STRENGTH_COLORS,
  checkRateLimit,
  recordFailedAttempt,
  resetRateLimit,
} from "@/utils/security";
import { generateDnaKey } from "@/utils/dna";
import { DEFAULT_DNA_COLORS } from "@/utils/dna";
import type { DnaKey } from "@/utils/dna";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function useShakeAnim() {
  const shake = useRef(new RNAnimated.Value(0)).current;
  const trigger = () => {
    shake.setValue(0);
    RNAnimated.sequence([
      RNAnimated.timing(shake, { toValue: 10, duration: 60, useNativeDriver: true }),
      RNAnimated.timing(shake, { toValue: -10, duration: 60, useNativeDriver: true }),
      RNAnimated.timing(shake, { toValue: 8, duration: 60, useNativeDriver: true }),
      RNAnimated.timing(shake, { toValue: -8, duration: 60, useNativeDriver: true }),
      RNAnimated.timing(shake, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  };
  return { shake, trigger };
}

// ─── DNA Reveal Screen ────────────────────────────────────────────────────────

function DnaRevealScreen({
  dnaKey,
  username,
  onContinue,
}: {
  dnaKey: DnaKey;
  username: string;
  onContinue: () => void;
}) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.revealContainer, { paddingTop: Platform.OS === "web" ? 67 : insets.top }]}>
      <View style={styles.revealInner}>
        <Text style={styles.revealTitle}>Your DNA Key</Text>
        <Text style={styles.revealSub}>
          This pattern is unique to you. Your credentials regenerate it — no recovery code needed.
        </Text>

        <View style={styles.revealHelixWrapper}>
          <DnaHelix colorPairs={dnaKey.colorPairs} size="large" speed={4000} />
        </View>

        <View style={styles.fingerprintRow}>
          <Text style={styles.fingerprintLabel}>IDENTITY FINGERPRINT</Text>
          <Text style={styles.fingerprintValue}>{dnaKey.fingerprint}</Text>
        </View>

        <View style={styles.basesRow}>
          {dnaKey.bases.map((base, i) => (
            <View
              key={i}
              style={[
                styles.baseChip,
                { borderColor: dnaKey.colorPairs[i % dnaKey.colorPairs.length][0] + "60" },
              ]}
            >
              <Text
                style={[
                  styles.baseChipText,
                  { color: dnaKey.colorPairs[i % dnaKey.colorPairs.length][0] },
                ]}
              >
                {base}
              </Text>
            </View>
          ))}
        </View>

        <Text style={styles.revealNote}>
          Memorise your passphrase — it regenerates this identity on any device.
        </Text>

        <Pressable
          style={({ pressed }) => [styles.continueBtn, { opacity: pressed ? 0.85 : 1 }]}
          onPress={onContinue}
        >
          <Text style={styles.continueBtnText}>Enter CryptId</Text>
          <Ionicons name="arrow-forward" size={18} color={Colors.background} />
        </Pressable>
      </View>
    </View>
  );
}

// ─── Register Screen ──────────────────────────────────────────────────────────

function RegisterScreen({ onSwitch }: { onSwitch: () => void }) {
  const insets = useSafeAreaInsets();
  const { register } = useAuth();
  const [username, setUsername] = useState("");
  const [passphrase, setPassphrase] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [previewDna, setPreviewDna] = useState<DnaKey | null>(null);
  const [revealDna, setRevealDna] = useState<DnaKey | null>(null);
  const { shake, trigger } = useShakeAnim();

  // Live DNA preview while typing
  useEffect(() => {
    if (username.length >= 3 && passphrase.length >= 4) {
      const t = setTimeout(() => {
        generateDnaKey(username, passphrase).then(setPreviewDna);
      }, 400);
      return () => clearTimeout(t);
    } else {
      setPreviewDna(null);
    }
  }, [username, passphrase]);

  const strength = passphraseStrength(passphrase);

  const handleRegister = async () => {
    setError("");
    const uErr = validateUsername(sanitize(username));
    if (uErr) { setError(uErr); trigger(); return; }
    const pErr = validatePassphrase(passphrase);
    if (pErr) { setError(pErr); trigger(); return; }
    if (passphrase !== confirm) { setError("Passphrases do not match."); trigger(); return; }

    setIsLoading(true);
    const dnaKey = await generateDnaKey(username, passphrase);
    const result = await register(username.trim(), passphrase);
    setIsLoading(false);

    if (result.error) {
      setError(result.error);
      trigger();
    } else {
      setRevealDna(dnaKey);
    }
  };

  if (revealDna) {
    return <DnaRevealScreen dnaKey={revealDna} username={username} onContinue={() => {}} />;
  }

  return (
    <ScrollView
      style={styles.scrollContainer}
      contentContainerStyle={[
        styles.scrollContent,
        { paddingTop: Platform.OS === "web" ? 67 : insets.top + 8 },
      ]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {/* DNA Preview */}
      <View style={styles.helixWrapper}>
        <DnaHelix
          colorPairs={previewDna?.colorPairs ?? DEFAULT_DNA_COLORS}
          size="medium"
          speed={previewDna ? 4000 : 7000}
        />
      </View>

      <Text style={styles.appTitle}>CryptId</Text>
      <Text style={styles.appTagline}>Create your identity</Text>

      <RNAnimated.View style={[styles.formCard, { transform: [{ translateX: shake }] }]}>
        {/* Username */}
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>USERNAME</Text>
          <View style={styles.inputWrap}>
            <Ionicons name="person-outline" size={16} color={Colors.textMuted} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="3–20 chars, letters & numbers"
              placeholderTextColor={Colors.textMuted}
              value={username}
              onChangeText={(t) => setUsername(sanitize(t, 20))}
              autoCapitalize="none"
              autoCorrect={false}
              maxLength={20}
              returnKeyType="next"
            />
          </View>
        </View>

        {/* Passphrase */}
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>PASSPHRASE</Text>
          <View style={styles.inputWrap}>
            <Ionicons name="key-outline" size={16} color={Colors.textMuted} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="8+ chars, include a number"
              placeholderTextColor={Colors.textMuted}
              value={passphrase}
              onChangeText={setPassphrase}
              secureTextEntry={!showPass}
              autoCapitalize="none"
              autoCorrect={false}
              maxLength={64}
              returnKeyType="next"
            />
            <Pressable onPress={() => setShowPass((v) => !v)} style={styles.eyeBtn}>
              <Ionicons name={showPass ? "eye-off-outline" : "eye-outline"} size={18} color={Colors.textMuted} />
            </Pressable>
          </View>

          {/* Strength bar */}
          {passphrase.length > 0 && (
            <View style={styles.strengthRow}>
              <View style={styles.strengthBars}>
                {[0, 1, 2].map((i) => (
                  <View
                    key={i}
                    style={[
                      styles.strengthSegment,
                      { backgroundColor: strength > i ? STRENGTH_COLORS[strength] : Colors.border },
                    ]}
                  />
                ))}
              </View>
              <Text style={[styles.strengthLabel, { color: STRENGTH_COLORS[strength] }]}>
                {STRENGTH_LABELS[strength]}
              </Text>
            </View>
          )}
        </View>

        {/* Confirm passphrase */}
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>CONFIRM PASSPHRASE</Text>
          <View style={styles.inputWrap}>
            <Ionicons name="shield-checkmark-outline" size={16} color={Colors.textMuted} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Repeat your passphrase"
              placeholderTextColor={Colors.textMuted}
              value={confirm}
              onChangeText={setConfirm}
              secureTextEntry={!showPass}
              autoCapitalize="none"
              autoCorrect={false}
              maxLength={64}
              returnKeyType="done"
              onSubmitEditing={handleRegister}
            />
          </View>
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <Pressable
          style={({ pressed }) => [styles.primaryBtn, { opacity: pressed ? 0.85 : 1 }]}
          onPress={handleRegister}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color={Colors.background} size="small" />
          ) : (
            <>
              <Text style={styles.primaryBtnText}>Generate DNA Identity</Text>
              <Ionicons name="dna" size={18} color={Colors.background} />
            </>
          )}
        </Pressable>
      </RNAnimated.View>

      <Pressable onPress={onSwitch} style={styles.switchRow}>
        <Text style={styles.switchText}>Already have an identity?</Text>
        <Text style={styles.switchLink}> Sign in</Text>
      </Pressable>

      <View style={{ height: Platform.OS === "web" ? 34 : insets.bottom + 16 }} />
    </ScrollView>
  );
}

// ─── Login Screen ─────────────────────────────────────────────────────────────

function LoginScreen({ onSwitch }: { onSwitch: () => void }) {
  const insets = useSafeAreaInsets();
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [passphrase, setPassphrase] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [lockInfo, setLockInfo] = useState("");
  const { shake, trigger } = useShakeAnim();

  const handleLogin = async () => {
    setError("");
    if (!username.trim() || !passphrase) {
      setError("Enter your username and passphrase.");
      trigger();
      return;
    }

    const { allowed, remainingSecs } = await checkRateLimit();
    if (!allowed) {
      setLockInfo(`Too many attempts. Try again in ${remainingSecs}s.`);
      trigger();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    setIsLoading(true);
    const result = await login(username.trim(), passphrase);
    setIsLoading(false);

    if (result.error) {
      await recordFailedAttempt();
      setError(result.error);
      trigger();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } else {
      await resetRateLimit();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  // Countdown timer if locked
  useEffect(() => {
    if (!lockInfo) return;
    const interval = setInterval(async () => {
      const { allowed, remainingSecs } = await checkRateLimit();
      if (allowed) {
        setLockInfo("");
      } else {
        setLockInfo(`Too many attempts. Try again in ${remainingSecs}s.`);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [lockInfo]);

  return (
    <ScrollView
      style={styles.scrollContainer}
      contentContainerStyle={[
        styles.scrollContent,
        { paddingTop: Platform.OS === "web" ? 67 : insets.top + 8 },
      ]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.helixWrapper}>
        <DnaHelix colorPairs={DEFAULT_DNA_COLORS} size="medium" speed={7000} />
      </View>

      <Text style={styles.appTitle}>CryptId</Text>
      <Text style={styles.appTagline}>Verify your identity</Text>

      <RNAnimated.View style={[styles.formCard, { transform: [{ translateX: shake }] }]}>
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>USERNAME</Text>
          <View style={styles.inputWrap}>
            <Ionicons name="person-outline" size={16} color={Colors.textMuted} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Your username"
              placeholderTextColor={Colors.textMuted}
              value={username}
              onChangeText={(t) => setUsername(sanitize(t, 20))}
              autoCapitalize="none"
              autoCorrect={false}
              maxLength={20}
              returnKeyType="next"
            />
          </View>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>PASSPHRASE</Text>
          <View style={styles.inputWrap}>
            <Ionicons name="key-outline" size={16} color={Colors.textMuted} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="Your passphrase"
              placeholderTextColor={Colors.textMuted}
              value={passphrase}
              onChangeText={setPassphrase}
              secureTextEntry={!showPass}
              autoCapitalize="none"
              autoCorrect={false}
              maxLength={64}
              returnKeyType="done"
              onSubmitEditing={handleLogin}
            />
            <Pressable onPress={() => setShowPass((v) => !v)} style={styles.eyeBtn}>
              <Ionicons name={showPass ? "eye-off-outline" : "eye-outline"} size={18} color={Colors.textMuted} />
            </Pressable>
          </View>
        </View>

        {lockInfo ? (
          <View style={styles.lockRow}>
            <Ionicons name="lock-closed" size={14} color={Colors.danger} />
            <Text style={styles.lockText}>{lockInfo}</Text>
          </View>
        ) : error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : null}

        <Pressable
          style={({ pressed }) => [styles.primaryBtn, { opacity: pressed ? 0.85 : 1 }]}
          onPress={handleLogin}
          disabled={isLoading || !!lockInfo}
        >
          {isLoading ? (
            <ActivityIndicator color={Colors.background} size="small" />
          ) : (
            <>
              <Text style={styles.primaryBtnText}>Unlock Identity</Text>
              <Ionicons name="finger-print" size={18} color={Colors.background} />
            </>
          )}
        </Pressable>

        <View style={styles.recoveryHint}>
          <Ionicons name="information-circle-outline" size={14} color={Colors.textMuted} />
          <Text style={styles.recoveryText}>
            Same credentials regenerate your DNA — no recovery code needed.
          </Text>
        </View>
      </RNAnimated.View>

      <Pressable onPress={onSwitch} style={styles.switchRow}>
        <Text style={styles.switchText}>New to CryptId?</Text>
        <Text style={styles.switchLink}> Create identity</Text>
      </Pressable>

      <View style={{ height: Platform.OS === "web" ? 34 : insets.bottom + 16 }} />
    </ScrollView>
  );
}

// ─── AuthGate ─────────────────────────────────────────────────────────────────

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const { isLoading, hasAccount, isAuthenticated } = useAuth();
  const [showRegister, setShowRegister] = useState(false);

  // Decide default screen: if no account → register; otherwise → login
  useEffect(() => {
    if (!isLoading) {
      setShowRegister(!hasAccount);
    }
  }, [isLoading, hasAccount]);

  if (isLoading) {
    return (
      <View style={styles.loadingScreen}>
        <DnaHelix colorPairs={DEFAULT_DNA_COLORS} size="small" speed={3000} />
        <ActivityIndicator color={Colors.primary} style={{ marginTop: 24 }} />
      </View>
    );
  }

  if (!isAuthenticated) {
    if (showRegister) {
      return <RegisterScreen onSwitch={() => setShowRegister(false)} />;
    }
    return <LoginScreen onSwitch={() => setShowRegister(true)} />;
  }

  return <>{children}</>;
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  loadingScreen: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  scrollContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingHorizontal: 24,
    alignItems: "center",
  },
  helixWrapper: {
    marginBottom: 8,
    marginTop: 8,
  },
  appTitle: {
    fontSize: 34,
    fontWeight: "700",
    color: Colors.textPrimary,
    fontFamily: "Inter_700Bold",
    letterSpacing: 3,
    marginTop: 8,
  },
  appTagline: {
    fontSize: 14,
    color: Colors.textMuted,
    fontFamily: "Inter_400Regular",
    marginBottom: 24,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  formCard: {
    width: "100%",
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 16,
  },
  fieldGroup: {
    gap: 6,
  },
  fieldLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: Colors.textMuted,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 1.5,
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: 46,
    fontSize: 15,
    color: Colors.textPrimary,
    fontFamily: "Inter_400Regular",
  },
  eyeBtn: {
    padding: 4,
    marginLeft: 8,
  },
  strengthRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
  },
  strengthBars: {
    flexDirection: "row",
    gap: 4,
    flex: 1,
  },
  strengthSegment: {
    flex: 1,
    height: 3,
    borderRadius: 2,
  },
  strengthLabel: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    minWidth: 52,
    textAlign: "right",
  },
  errorText: {
    fontSize: 13,
    color: Colors.danger,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
  },
  lockRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    justifyContent: "center",
  },
  lockText: {
    fontSize: 13,
    color: Colors.danger,
    fontFamily: "Inter_500Medium",
  },
  primaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 14,
    marginTop: 4,
  },
  primaryBtnText: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.background,
    fontFamily: "Inter_700Bold",
  },
  recoveryHint: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
    marginTop: 2,
  },
  recoveryText: {
    fontSize: 12,
    color: Colors.textMuted,
    fontFamily: "Inter_400Regular",
    flex: 1,
    lineHeight: 17,
  },
  switchRow: {
    flexDirection: "row",
    marginTop: 20,
    marginBottom: 8,
  },
  switchText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontFamily: "Inter_400Regular",
  },
  switchLink: {
    fontSize: 14,
    color: Colors.primary,
    fontFamily: "Inter_600SemiBold",
  },
  // DNA Reveal
  revealContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  revealInner: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  revealTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: Colors.textPrimary,
    fontFamily: "Inter_700Bold",
    marginBottom: 8,
    letterSpacing: 1,
  },
  revealSub: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 16,
  },
  revealHelixWrapper: {
    marginVertical: 16,
  },
  fingerprintRow: {
    alignItems: "center",
    marginVertical: 12,
    gap: 4,
  },
  fingerprintLabel: {
    fontSize: 10,
    color: Colors.textMuted,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 2,
  },
  fingerprintValue: {
    fontSize: 18,
    color: Colors.primary,
    fontFamily: "Inter_700Bold",
    letterSpacing: 4,
  },
  basesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    justifyContent: "center",
    marginVertical: 12,
  },
  baseChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: Colors.surface,
  },
  baseChipText: {
    fontSize: 13,
    fontFamily: "Inter_700Bold",
    letterSpacing: 2,
  },
  revealNote: {
    fontSize: 13,
    color: Colors.textMuted,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 19,
    marginVertical: 12,
    paddingHorizontal: 8,
  },
  continueBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 32,
    marginTop: 8,
  },
  continueBtnText: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.background,
    fontFamily: "Inter_700Bold",
  },
});
