import { isLiquidGlassAvailable } from "expo-glass-effect";
import { Tabs } from "expo-router";
import { NativeTabs, Icon, Label } from "expo-router/unstable-native-tabs";
import { BlurView } from "expo-blur";
import { SymbolView } from "expo-symbols";
import { Platform, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import Colors from "@/constants/colors";

function NativeTabLayout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="index">
        <Icon sf={{ default: "book.closed", selected: "book.closed.fill" }} />
        <Label>Field Guide</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="sightings">
        <Icon sf={{ default: "eye", selected: "eye.fill" }} />
        <Label>Sightings</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="log">
        <Icon sf={{ default: "plus.circle", selected: "plus.circle.fill" }} />
        <Label>Report</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}

function ClassicTabLayout() {
  const isIOS = Platform.OS === "ios";
  const isWeb = Platform.OS === "web";

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.tabIconDefault,
        tabBarStyle: {
          position: "absolute",
          backgroundColor: isIOS ? "transparent" : Colors.surface,
          borderTopWidth: isWeb ? 1 : 0,
          borderTopColor: Colors.border,
          elevation: 0,
          ...(isWeb ? { height: 84 } : {}),
        },
        tabBarBackground: () =>
          isIOS ? (
            <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill} />
          ) : isWeb ? (
            <View style={[StyleSheet.absoluteFill, { backgroundColor: Colors.surface }]} />
          ) : null,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Field Guide",
          tabBarIcon: ({ color }) =>
            Platform.OS === "ios" ? (
              <SymbolView name="book.closed.fill" tintColor={color} size={22} />
            ) : (
              <Ionicons name="book" size={22} color={color} />
            ),
        }}
      />
      <Tabs.Screen
        name="sightings"
        options={{
          title: "Sightings",
          tabBarIcon: ({ color }) =>
            Platform.OS === "ios" ? (
              <SymbolView name="eye.fill" tintColor={color} size={22} />
            ) : (
              <Ionicons name="eye" size={22} color={color} />
            ),
        }}
      />
      <Tabs.Screen
        name="log"
        options={{
          title: "Report",
          tabBarIcon: ({ color }) =>
            Platform.OS === "ios" ? (
              <SymbolView name="plus.circle.fill" tintColor={color} size={22} />
            ) : (
              <Ionicons name="add-circle" size={22} color={color} />
            ),
        }}
      />
    </Tabs>
  );
}

export default function TabLayout() {
  if (isLiquidGlassAvailable()) {
    return <NativeTabLayout />;
  }
  return <ClassicTabLayout />;
}
