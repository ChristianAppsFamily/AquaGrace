import * as Haptics from "expo-haptics";
import React, { useCallback, useRef } from "react";
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  ViewStyle,
} from "react-native";

interface RippleButtonProps {
  label: string;
  sublabel?: string;
  onPress: () => void;
  style?: ViewStyle;
  color?: string;
  textColor?: string;
}

export default function RippleButton({
  label,
  sublabel,
  onPress,
  style,
  color = "#2196F3",
  textColor = "#FFFFFF",
}: RippleButtonProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = useCallback(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 0.92,
        useNativeDriver: true,
        speed: 50,
        bounciness: 4,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0.85,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, [scaleAnim, opacityAnim]);

  const handlePressOut = useCallback(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        speed: 20,
        bounciness: 8,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [scaleAnim, opacityAnim]);

  const handlePress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  }, [onPress]);

  return (
    <Animated.View
      style={[
        { transform: [{ scale: scaleAnim }], opacity: opacityAnim },
      ]}
    >
      <Pressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[styles.button, { backgroundColor: color }, style]}
        testID={`ripple-btn-${label}`}
      >
        <Text style={[styles.label, { color: textColor }]}>{label}</Text>
        {sublabel ? (
          <Text style={[styles.sublabel, { color: textColor, opacity: 0.7 }]}>
            {sublabel}
          </Text>
        ) : null}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 90,
  },
  label: {
    fontSize: 18,
    fontWeight: "700" as const,
    letterSpacing: -0.3,
  },
  sublabel: {
    fontSize: 11,
    fontWeight: "500" as const,
    marginTop: 2,
  },
});
