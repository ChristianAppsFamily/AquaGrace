import React from "react";
import { StyleSheet, Text, View } from "react-native";

import Colors from "@/constants/colors";
import { useWater } from "@/providers/WaterProvider";

export default function AdBanner() {
  const { settings, hasRemovedAds } = useWater();
  const colors = settings.darkMode ? Colors.dark : Colors.light;

  if (hasRemovedAds) {
    return null;
  }

  return (
    <View
      style={[
        styles.webFallback,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
      testID="ad-banner-web-fallback"
    >
      <Text style={[styles.webFallbackText, { color: colors.textSecondary }]}>
        Ad space
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  webFallback: {
    alignItems: "center",
    borderTopWidth: StyleSheet.hairlineWidth,
    justifyContent: "center",
    minHeight: 48,
    width: "100%",
  },
  webFallbackText: {
    fontSize: 12,
    fontWeight: "600" as const,
    letterSpacing: 0.4,
    textTransform: "uppercase" as const,
  },
});
