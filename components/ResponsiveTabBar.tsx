import React from "react";
import { Platform, Pressable, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import Colors from "@/constants/colors";

const ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  index: "chatbubbles-outline",
  settings: "options-outline",
};

export default function ResponsiveTabBar({ state, navigation, descriptors }: BottomTabBarProps) {
  const { width } = useWindowDimensions();
  const desktop = Platform.OS === "web" && width >= 900;

  return (
    <View style={[styles.shell, desktop ? styles.desktop : styles.mobile]}>
      {desktop ? (
        <View style={styles.brand}>
          <View style={styles.brandMark}><Ionicons name="aperture-outline" size={20} color={Colors.primary} /></View>
          <Text style={styles.brandText}>CryptId</Text>
          <Text style={styles.brandCaption}>PRIVATE SESSION</Text>
        </View>
      ) : null}
      <View style={[styles.items, desktop ? styles.itemsDesktop : styles.itemsMobile]}>
        {state.routes.map((route, index) => {
          const focused = state.index === index;
          const label = descriptors[route.key].options.title ?? (route.name === "index" ? "Channels" : "Settings");
          return (
            <Pressable
              key={route.key}
              accessibilityRole="tab"
              accessibilityState={{ selected: focused }}
              accessibilityLabel={label}
              onPress={() => {
                const event = navigation.emit({ type: "tabPress", target: route.key, canPreventDefault: true });
                if (!focused && !event.defaultPrevented) navigation.navigate(route.name, route.params);
              }}
              onLongPress={() => navigation.emit({ type: "tabLongPress", target: route.key })}
              style={({ pressed }) => [
                styles.item,
                desktop ? styles.itemDesktop : styles.itemMobile,
                focused && styles.itemFocused,
                pressed && styles.itemPressed,
              ]}
            >
              <Ionicons name={ICONS[route.name] ?? "ellipse-outline"} size={20} color={focused ? Colors.primary : Colors.textMuted} />
              <Text style={[styles.label, focused && styles.labelFocused]}>{label}</Text>
              {desktop && focused ? <View style={styles.activeMark} /> : null}
            </Pressable>
          );
        })}
      </View>
      {desktop ? (
        <View style={styles.sidebarFoot}>
          <View style={styles.statusDot} />
          <View>
          <Text style={styles.sidebarStatus}>Shared account</Text>
          <Text style={styles.sidebarSub}>Login expires after 24 hours</Text>
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  shell: { backgroundColor: Colors.surface, borderColor: Colors.border, zIndex: 2 },
  desktop: { width: 238, height: "100%", borderRightWidth: 1, paddingHorizontal: 16, paddingTop: 30, paddingBottom: 20, justifyContent: "space-between" },
  mobile: { minHeight: 68, borderTopWidth: 1, flexDirection: "row", justifyContent: "center", paddingHorizontal: 20, paddingTop: 8, paddingBottom: 8 },
  brand: { paddingHorizontal: 12, paddingBottom: 42 },
  brandMark: { width: 38, height: 38, borderRadius: 13, backgroundColor: Colors.primaryFaint, borderWidth: 1, borderColor: Colors.border, alignItems: "center", justifyContent: "center", marginBottom: 12 },
  brandText: { color: Colors.textPrimary, fontFamily: "Inter_700Bold", fontSize: 22, letterSpacing: -0.7 },
  brandCaption: { color: Colors.primary, fontFamily: "Inter_600SemiBold", fontSize: 9, letterSpacing: 2.2, marginTop: 5 },
  items: { gap: 8 },
  itemsDesktop: { flex: 1 },
  itemsMobile: { flexDirection: "row", alignItems: "center", gap: 14 },
  item: { flexDirection: "row", alignItems: "center", gap: 12, borderRadius: 12, position: "relative" },
  itemDesktop: { paddingHorizontal: 13, paddingVertical: 13 },
  itemMobile: { minWidth: 100, justifyContent: "center", paddingHorizontal: 14, paddingVertical: 10 },
  itemFocused: { backgroundColor: Colors.primaryFaint },
  itemPressed: { opacity: 0.72 },
  label: { color: Colors.textMuted, fontFamily: "Inter_500Medium", fontSize: 13 },
  labelFocused: { color: Colors.textPrimary },
  activeMark: { position: "absolute", right: 0, height: 22, width: 2, borderRadius: 2, backgroundColor: Colors.primary },
  sidebarFoot: { borderTopWidth: 1, borderTopColor: Colors.borderLight, paddingTop: 18, flexDirection: "row", alignItems: "flex-start", gap: 10 },
  statusDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: Colors.primary, marginTop: 5 },
  sidebarStatus: { color: Colors.textPrimary, fontFamily: "Inter_500Medium", fontSize: 12 },
  sidebarSub: { color: Colors.textMuted, fontFamily: "Inter_400Regular", fontSize: 11, marginTop: 3 },
});