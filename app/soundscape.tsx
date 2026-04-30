import { router } from "expo-router";
import { CloudRain, Droplets, Waves, X, Zap } from "lucide-react-native";
import React, { useCallback, useRef, useState } from "react";
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Colors from "@/constants/colors";
import { useWater } from "@/providers/WaterProvider";

interface SoundOption {
  id: string;
  label: string;
  icon: React.ReactNode;
}

export default function SoundscapeScreen() {
  const insets = useSafeAreaInsets();
  const { settings } = useWater();
  const isDark = settings.darkMode;
  const colors = isDark ? Colors.dark : Colors.light;
  const [activeSound, setActiveSound] = useState<string | null>(null);
  const [blackScreen, setBlackScreen] = useState<boolean>(false);

  const pulseAnim = useRef(new Animated.Value(1)).current;

  const startPulse = useCallback(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [pulseAnim]);

  const stopPulse = useCallback(() => {
    pulseAnim.stopAnimation();
    Animated.timing(pulseAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [pulseAnim]);

  const handleToggleSound = useCallback(
    (soundId: string) => {
      if (activeSound === soundId) {
        setActiveSound(null);
        stopPulse();
        console.log(`[AquaFlow] Stopped sound: ${soundId}`);
      } else {
        setActiveSound(soundId);
        startPulse();
        console.log(`[AquaFlow] Playing sound: ${soundId}`);
      }
    },
    [activeSound, startPulse, stopPulse]
  );

  const soundOptions: SoundOption[] = [
    {
      id: "rain",
      label: "Rain",
      icon: <CloudRain size={28} color={activeSound === "rain" ? "#FFF" : colors.text} />,
    },
    {
      id: "stream",
      label: "Stream",
      icon: <Waves size={28} color={activeSound === "stream" ? "#FFF" : colors.text} />,
    },
    {
      id: "ocean",
      label: "Ocean",
      icon: <Zap size={28} color={activeSound === "ocean" ? "#FFF" : colors.text} />,
    },
    {
      id: "drops",
      label: "Drops",
      icon: <Droplets size={28} color={activeSound === "drops" ? "#FFF" : colors.text} />,
    },
  ];

  if (blackScreen && activeSound) {
    return (
      <Pressable
        style={styles.blackScreen}
        onPress={() => setBlackScreen(false)}
      >
        <Animated.View
          style={[
            styles.blackPulse,
            { transform: [{ scale: pulseAnim }] },
          ]}
        >
          <View style={styles.blackDot} />
        </Animated.View>
        <Text style={styles.blackHint}>Tap anywhere to exit</Text>
      </Pressable>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Text style={[styles.title, { color: colors.text }]}>Soundscape</Text>
        <Pressable
          onPress={() => router.back()}
          style={[styles.closeBtn, { backgroundColor: colors.surfaceSecondary }]}
          testID="close-soundscape"
        >
          <X size={20} color={colors.text} />
        </Pressable>
      </View>

      <View style={styles.content}>
        <Animated.View
          style={[
            styles.visualizer,
            {
              transform: [{ scale: activeSound ? pulseAnim : 1 }],
            },
          ]}
        >
          <View
            style={[
              styles.visualizerOuter,
              {
                borderColor: activeSound ? colors.tint : colors.border,
                backgroundColor: activeSound
                  ? `${colors.tint}10`
                  : "transparent",
              },
            ]}
          >
            <View
              style={[
                styles.visualizerInner,
                {
                  borderColor: activeSound ? colors.tint : colors.borderLight,
                  backgroundColor: activeSound
                    ? `${colors.tint}20`
                    : "transparent",
                },
              ]}
            >
              <View
                style={[
                  styles.visualizerCore,
                  {
                    backgroundColor: activeSound ? colors.tint : colors.border,
                  },
                ]}
              />
            </View>
          </View>
        </Animated.View>

        <Text style={[styles.statusText, { color: colors.textSecondary }]}>
          {activeSound
            ? `Playing: ${soundOptions.find((s) => s.id === activeSound)?.label ?? ""}`
            : "Select a sound to relax"}
        </Text>

        <View style={styles.soundGrid}>
          {soundOptions.map((sound) => {
            const isActive = activeSound === sound.id;
            return (
              <Pressable
                key={sound.id}
                onPress={() => handleToggleSound(sound.id)}
                style={[
                  styles.soundCard,
                  {
                    backgroundColor: isActive ? colors.tint : colors.surface,
                    borderColor: isActive ? colors.tint : colors.border,
                  },
                ]}
                testID={`sound-${sound.id}`}
              >
                {sound.icon}
                <Text
                  style={[
                    styles.soundLabel,
                    { color: isActive ? "#FFF" : colors.text },
                  ]}
                >
                  {sound.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {activeSound && (
          <Pressable
            onPress={() => setBlackScreen(true)}
            style={[
              styles.blackScreenBtn,
              { backgroundColor: colors.surfaceSecondary, borderColor: colors.border },
            ]}
            testID="black-screen-btn"
          >
            <Text style={[styles.blackScreenBtnText, { color: colors.text }]}>
              Black Screen Mode
            </Text>
            <Text style={[styles.blackScreenHint, { color: colors.textTertiary }]}>
              Save battery while listening
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "800" as const,
    letterSpacing: -0.6,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  visualizer: {
    marginBottom: 32,
  },
  visualizerOuter: {
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  visualizerInner: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  visualizerCore: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 15,
    fontWeight: "500" as const,
    marginBottom: 40,
  },
  soundGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    justifyContent: "center",
    width: "100%",
  },
  soundCard: {
    width: "46%",
    paddingVertical: 24,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  soundLabel: {
    fontSize: 14,
    fontWeight: "600" as const,
  },
  blackScreenBtn: {
    marginTop: 32,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    width: "100%",
  },
  blackScreenBtnText: {
    fontSize: 15,
    fontWeight: "600" as const,
  },
  blackScreenHint: {
    fontSize: 12,
    fontWeight: "400" as const,
    marginTop: 2,
  },
  blackScreen: {
    flex: 1,
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "center",
  },
  blackPulse: {
    marginBottom: 40,
  },
  blackDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#00BFFF",
    opacity: 0.6,
  },
  blackHint: {
    color: "#333",
    fontSize: 13,
    fontWeight: "400" as const,
  },
});
