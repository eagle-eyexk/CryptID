import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Easing,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useAuth } from "@/context/auth";
import { useChats } from "@/context/chats";
import Colors from "@/constants/colors";

type Mode = "register" | "login";

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const { isLoading, isAuthenticated, login, register } = useAuth();
  const { clearAllMessages } = useChats();
  const [mode, setMode] = useState<Mode>("register");
  const [username, setUsername] = useState("");
  const [passphrase, setPassphrase] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const previousAuth = useRef<boolean | null>(null);
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(10)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 420, easing: Easing.out(Easing.cubic), useNativeDriver: false }),
      Animated.timing(translateY, { toValue: 0, duration: 420, easing: Easing.out(Easing.cubic), useNativeDriver: false }),
    ]).start();
  }, [opacity, translateY]);

  useEffect(() => {
    if (previousAuth.current === true && !isAuthenticated) clearAllMessages();
    previousAuth.current = isAuthenticated;
  }, [isAuthenticated, clearAllMessages]);

  const submit = async () => {
    setError("");
    const normalizedUsername = username.trim();
    if (!/^[a-z0-9][a-z0-9._-]{2,23}$/i.test(normalizedUsername)) {
      setError("Use 3–24 letters, numbers, periods, underscores, or hyphens.");
      return;
    }
    if (passphrase.length < 12 || passphrase.length > 128) {
      setError("Use a passphrase between 12 and 128 characters.");
      return;
    }
    if (mode === "register" && passphrase !== confirmation) {
      setError("Those passphrases do not match.");
      return;
    }

    setBusy(true);
    try {
      const result = mode === "register"
        ? await register(normalizedUsername, passphrase)
        : await login(normalizedUsername, passphrase);
      if (result.error) setError(result.error);
    } catch {
      setError("Account access is temporarily unavailable. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={Colors.primary} />
        <Text style={styles.loadingText}>Checking your session</Text>
      </View>
    );
  }

  if (isAuthenticated) return <>{children}</>;

  return (
    <View style={styles.page}>
      <View pointerEvents="none" style={styles.orbitLarge} />
      <View pointerEvents="none" style={styles.orbitSmall} />
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Animated.View style={[styles.shell, { opacity, transform: [{ translateY }] }]}>
          <View style={styles.topbar}>
            <View style={styles.brand}>
              <View style={styles.brandMark}><Text style={styles.brandMarkText}>C</Text></View>
              <Text style={styles.brandName}>CryptID</Text>
            </View>
            <View style={styles.topTag}><View style={styles.statusDot} /><Text style={styles.topTagText}>SHARED ACCOUNT ACCESS</Text></View>
          </View>

          <View style={styles.content}>
            <View style={styles.intro}>
              <Text style={styles.eyebrow}>A QUIETER KIND OF CONVERSATION</Text>
              <Text style={styles.headline}>Keep the account.{`\n`}Let the session end.</Text>
              <Text style={styles.introCopy}>
                Your username stays yours across devices. Each login ends automatically after 24 hours.
              </Text>

              <View style={styles.factRow}>
                <View style={styles.fact}>
                  <Text style={styles.factNumber}>24h</Text>
                  <Text style={styles.factLabel}>FIXED SESSION</Text>
                </View>
                <View style={styles.factRule} />
                <View style={styles.fact}>
                  <Text style={styles.factNumber}>0</Text>
                  <Text style={styles.factLabel}>PUBLIC DETAILS</Text>
                </View>
              </View>

              <View style={styles.notice}>
                <Text style={styles.noticeLabel}>CLEAR LIMITS</Text>
                <Text style={styles.noticeText}>
                  Chat messages are still local previews in this browser. They are not delivered and are not end-to-end encrypted.
                </Text>
              </View>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardEyebrow}>ACCOUNT ACCESS</Text>
              <Text style={styles.cardTitle}>{mode === "register" ? "Create your account" : "Welcome back"}</Text>
              <Text style={styles.cardSubtitle}>
                {mode === "register" ? "Create one account to use across your devices." : "Sign in to start a new 24-hour session."}
              </Text>

              <View style={styles.modeSwitch} accessibilityRole="tablist">
                <Pressable
                  accessibilityRole="tab"
                  accessibilityState={{ selected: mode === "register" }}
                  style={[styles.modeTab, mode === "register" && styles.modeTabActive]}
                  onPress={() => { setMode("register"); setError(""); }}
                >
                  <Text style={[styles.modeText, mode === "register" && styles.modeTextActive]}>Create account</Text>
                </Pressable>
                <Pressable
                  accessibilityRole="tab"
                  accessibilityState={{ selected: mode === "login" }}
                  style={[styles.modeTab, mode === "login" && styles.modeTabActive]}
                  onPress={() => { setMode("login"); setError(""); }}
                >
                  <Text style={[styles.modeText, mode === "login" && styles.modeTextActive]}>Sign in</Text>
                </Pressable>
              </View>

              <View style={styles.field}>
                <Text style={styles.fieldLabel}>USERNAME</Text>
                <TextInput
                  accessibilityLabel="Username"
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="username"
                  maxLength={24}
                  placeholder="yourname"
                  placeholderTextColor={Colors.textMuted}
                  returnKeyType="next"
                  style={styles.input}
                  value={username}
                  onChangeText={setUsername}
                />
                <Text style={styles.fieldHint}>3–24 characters · used to sign in on any device</Text>
              </View>

              <View style={styles.field}>
                <Text style={styles.fieldLabel}>PASSPHRASE</Text>
                <TextInput
                  accessibilityLabel="Passphrase"
                  autoComplete={mode === "register" ? "new-password" : "current-password"}
                  maxLength={128}
                  onChangeText={setPassphrase}
                  onSubmitEditing={mode === "login" ? submit : undefined}
                  placeholder="At least 12 characters"
                  placeholderTextColor={Colors.textMuted}
                  returnKeyType={mode === "register" ? "next" : "go"}
                  secureTextEntry
                  style={styles.input}
                  value={passphrase}
                />
                <Text style={styles.fieldHint}>Never reuse a passphrase from another service.</Text>
              </View>

              {mode === "register" ? (
                <View style={styles.field}>
                  <Text style={styles.fieldLabel}>CONFIRM PASSPHRASE</Text>
                  <TextInput
                    accessibilityLabel="Confirm passphrase"
                    autoComplete="new-password"
                    maxLength={128}
                    onChangeText={setConfirmation}
                    onSubmitEditing={submit}
                    placeholder="Enter it again"
                    placeholderTextColor={Colors.textMuted}
                    returnKeyType="go"
                    secureTextEntry
                    style={styles.input}
                    value={confirmation}
                  />
                </View>
              ) : null}

              {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}

              <Pressable
                accessibilityRole="button"
                disabled={busy}
                onPress={submit}
                style={({ pressed }) => [styles.submit, pressed && !busy && styles.submitPressed, busy && styles.submitBusy]}
              >
                {busy ? <ActivityIndicator color={Colors.surface} size="small" /> : null}
                <Text style={styles.submitText}>{busy ? "Working…" : mode === "register" ? "Create account" : "Start 24-hour session"}</Text>
              </Pressable>

              <Text style={styles.cardFoot}>
                {mode === "register" ? "Already have an account?" : "New to CryptID?"}
                {" "}
                <Text style={styles.link} onPress={() => { setMode(mode === "register" ? "login" : "register"); setError(""); }}>
                  {mode === "register" ? "Sign in" : "Create one"}
                </Text>
              </Text>
            </View>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerBrand}>CryptID</Text>
            <Text style={styles.footerCopy}>Public disclosure: 0 details · Private authentication events do not include message contents, credentials, usernames, or IP addresses.</Text>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: Colors.background, overflow: "hidden" },
  scroll: { flexGrow: 1, justifyContent: "center", paddingHorizontal: 28, paddingVertical: 25 },
  shell: { width: "100%", maxWidth: 1160, alignSelf: "center" },
  orbitLarge: { position: "absolute", width: 560, height: 560, top: -310, right: -210, borderRadius: 280, borderWidth: 1, borderColor: Colors.borderLight, opacity: 0.7 },
  orbitSmall: { position: "absolute", width: 390, height: 390, top: -220, right: -120, borderRadius: 200, borderWidth: 1, borderColor: Colors.border, opacity: 0.5 },
  loading: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12, backgroundColor: Colors.background },
  loadingText: { color: Colors.textSecondary, fontSize: 12, fontFamily: "Inter_500Medium" },
  topbar: { minHeight: 64, flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderBottomWidth: 1, borderBottomColor: Colors.border, marginBottom: 44 },
  brand: { flexDirection: "row", alignItems: "center", gap: 10 },
  brandMark: { width: 30, height: 30, borderRadius: 10, borderBottomLeftRadius: 3, alignItems: "center", justifyContent: "center", backgroundColor: Colors.primary },
  brandMarkText: { color: Colors.surface, fontFamily: "Inter_700Bold", fontSize: 15 },
  brandName: { color: Colors.textPrimary, fontFamily: "Georgia", fontSize: 19, letterSpacing: -0.4 },
  topTag: { flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 8, paddingHorizontal: 11, borderWidth: 1, borderColor: Colors.border, borderRadius: 30 },
  topTagText: { color: Colors.textSecondary, fontFamily: "Inter_600SemiBold", fontSize: 9, letterSpacing: 1 },
  statusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.green },
  content: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 56 },
  intro: { flex: 1, maxWidth: 540, paddingVertical: 20 },
  eyebrow: { color: Colors.accent, fontFamily: "Inter_700Bold", fontSize: 9, letterSpacing: 1.9, marginBottom: 18 },
  headline: { color: Colors.textPrimary, fontFamily: "Georgia", fontSize: 48, lineHeight: 55, letterSpacing: -1.8 },
  introCopy: { color: Colors.textSecondary, fontFamily: "Inter_400Regular", fontSize: 14, lineHeight: 22, marginTop: 16, maxWidth: 430 },
  factRow: { flexDirection: "row", alignItems: "center", gap: 24, marginTop: 34 },
  fact: { minWidth: 106 },
  factNumber: { color: Colors.primary, fontFamily: "Georgia", fontSize: 29, lineHeight: 32 },
  factLabel: { color: Colors.textMuted, fontFamily: "Inter_600SemiBold", fontSize: 8, letterSpacing: 1.2, marginTop: 5 },
  factRule: { height: 42, width: 1, backgroundColor: Colors.border },
  notice: { maxWidth: 440, marginTop: 29, paddingTop: 13, borderTopWidth: 1, borderTopColor: Colors.border },
  noticeLabel: { color: Colors.accent, fontFamily: "Inter_700Bold", fontSize: 8, letterSpacing: 1.3, marginBottom: 7 },
  noticeText: { color: Colors.textMuted, fontFamily: "Inter_400Regular", fontSize: 11, lineHeight: 17 },
  card: { width: "100%", maxWidth: 410, padding: 27, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, borderRadius: 18, shadowColor: "#4E493F", shadowOpacity: 0.06, shadowRadius: 22, shadowOffset: { width: 0, height: 12 }, elevation: 2 },
  cardEyebrow: { color: Colors.primary, fontFamily: "Inter_700Bold", fontSize: 8, letterSpacing: 1.7 },
  cardTitle: { color: Colors.textPrimary, fontFamily: "Georgia", fontSize: 26, lineHeight: 32, marginTop: 10 },
  cardSubtitle: { color: Colors.textSecondary, fontFamily: "Inter_400Regular", fontSize: 11, lineHeight: 17, marginTop: 6, marginBottom: 20 },
  modeSwitch: { flexDirection: "row", padding: 3, borderRadius: 9, backgroundColor: Colors.surfaceElevated, marginBottom: 19 },
  modeTab: { flex: 1, minHeight: 35, alignItems: "center", justifyContent: "center", borderRadius: 7 },
  modeTabActive: { backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border },
  modeText: { color: Colors.textMuted, fontFamily: "Inter_500Medium", fontSize: 10 },
  modeTextActive: { color: Colors.textPrimary, fontFamily: "Inter_600SemiBold" },
  field: { gap: 7, marginBottom: 15 },
  fieldLabel: { color: Colors.textPrimary, fontFamily: "Inter_700Bold", fontSize: 8, letterSpacing: 1.2 },
  input: { height: 45, paddingHorizontal: 12, borderWidth: 1, borderColor: Colors.border, borderRadius: 9, backgroundColor: Colors.surface, color: Colors.textPrimary, fontFamily: "Inter_400Regular", fontSize: 12 },
  fieldHint: { color: Colors.textMuted, fontFamily: "Inter_400Regular", fontSize: 9, lineHeight: 14 },
  error: { color: Colors.danger, fontFamily: "Inter_500Medium", fontSize: 10, lineHeight: 15, marginBottom: 10 },
  submit: { minHeight: 47, marginTop: 3, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 9, borderRadius: 9, backgroundColor: Colors.primary, paddingHorizontal: 16 },
  submitPressed: { opacity: 0.82, transform: [{ scale: 0.99 }] },
  submitBusy: { opacity: 0.75 },
  submitText: { color: Colors.surface, fontFamily: "Inter_700Bold", fontSize: 11 },
  cardFoot: { color: Colors.textMuted, textAlign: "center", fontFamily: "Inter_400Regular", fontSize: 10, marginTop: 17 },
  link: { color: Colors.primary, fontFamily: "Inter_700Bold" },
  footer: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 20, paddingTop: 21, marginTop: 34, borderTopWidth: 1, borderTopColor: Colors.border },
  footerBrand: { color: Colors.textSecondary, fontFamily: "Georgia", fontSize: 12 },
  footerCopy: { flex: 1, maxWidth: 660, color: Colors.textMuted, textAlign: "right", fontFamily: "Inter_400Regular", fontSize: 9, lineHeight: 14 },
});
