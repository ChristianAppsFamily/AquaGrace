import { Tabs } from "expo-router";
import { BarChart3, Droplets, List, Settings } from "lucide-react-native";
import React from "react";
import { Platform, StyleSheet, View } from "react-native";

import AdBanner from "@/components/AdBanner";
import Colors from "@/constants/colors";
import { useWater } from "@/providers/WaterProvider";

export default function TabLayout() {
  const { settings } = useWater();
  const isDark = settings.darkMode;
  const colors = isDark ? Colors.dark : Colors.light;

  return (
    <View style={styles.container}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.tint,
          tabBarInactiveTintColor: colors.tabIconDefault,
          tabBarStyle: {
            backgroundColor: colors.surface,
            borderTopColor: colors.border,
            borderTopWidth: StyleSheet.hairlineWidth,
            ...(Platform.OS === "web" ? { height: 60 } : {}),
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: "600" as const,
          },
        }}
      >
        <Tabs.Screen
          name="(home)"
          options={{
            title: "Home",
            tabBarIcon: ({ color, size }) => <Droplets size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="log"
          options={{
            title: "Log",
            tabBarIcon: ({ color, size }) => <List size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="stats"
          options={{
            title: "Stats",
            tabBarIcon: ({ color, size }) => <BarChart3 size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: "Settings",
            tabBarIcon: ({ color, size }) => <Settings size={size} color={color} />,
          }}
        />
      </Tabs>
      <AdBanner />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
