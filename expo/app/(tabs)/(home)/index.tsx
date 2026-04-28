import { useAudioPlayer } from "expo-audio";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { BookOpen, Droplets, Flame, Minus, Music } from "lucide-react-native";
import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  Animated,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import CircularProgress from "@/components/CircularProgress";
import RippleButton from "@/components/RippleButton";
import Colors from "@/constants/colors";
import { getDrinkSoundUrl } from "@/constants/sounds";
import { getDailyVerse } from "@/constants/verses";
import { useTodayProgress, useWater } from "@/providers/WaterProvider";

const webInputReset = Platform.OS === "web"
  ? ({ outlineStyle: "none", outlineWidth: 0, outlineColor: "transparent" } as unknown as object)
  : null;

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { addWater, subtractWater, todayRecord, settings, streak, formatAmount: fmt, unitLabel: getUnit } = useWater();
  const { progress, remaining, total, goal } = useTodayProgress();
  const unit = getUnit();
  const [customModalVisible, setCustomModalVisible] = useState<boolean>(false);
  const [customAmount, setCustomAmount] = useState<string>("");
  const isDark = settings.darkMode;
  const dailyVerse = useMemo(() => getDailyVerse(), []);
  const colors = isDark ? Colors.dark : Colors.light;

  const splashAnim = useRef(new Animated.Value(0)).current;

  const drinkSoundUrl = getDrinkSoundUrl(settings.drinkSound);
  const audioSource = useMemo(
    () => (drinkSoundUrl ? { uri: drinkSoundUrl } : null),
    [drinkSoundUrl]
  );
  const soundPlayer = useAudioPlayer(audioSource);

  const playDrinkSound = useCallback(() => {
    if (!drinkSoundUrl) return;
    try {
      soundPlayer.seekTo(0);
      soundPlayer.play();
    } catch (err) {
      console.log("[AquaGrace] Sound play error", err);
    }
  }, [drinkSoundUrl, soundPlayer]);

  const handleAdd = useCallback(
    (amount: number) => {
      addWater(amount);
      playDrinkSound();
      Animated.sequence([
        Animated.timing(splashAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(splashAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();
    },
    [addWater, splashAnim, playDrinkSound]
  );

  const handleSubtract = useCallback(
    (amount: number) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      subtractWater(amount);
    },
    [subtractWater]
  );

  const handleCustomSubmit = useCallback(() => {
    const amount = parseInt(customAmount, 10);
    if (amount > 0 && amount <= 5000) {
      const mlAmount = settings.unit === 'oz' ? Math.round(amount * 29.5735) : amount;
      handleAdd(mlAmount);
      setCustomModalVisible(false);
      setCustomAmount("");
    }
  }, [customAmount, handleAdd, settings.unit]);

  const splashScale = splashAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 1.08, 1],
  });

  const percentage = Math.round(progress * 100);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View>
            <Text style={[styles.greeting, { color: colors.textSecondary }]}>
              {getGreeting()}
            </Text>
            <Text style={[styles.title, { color: colors.text }]}>
              AquaGrace
            </Text>
          </View>
          <Pressable
            onPress={() => router.push("/soundscape")}
            style={[styles.soundBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
            testID="soundscape-btn"
          >
            <Music size={20} color={colors.tint} />
          </Pressable>
        </View>

        <Animated.View
          style={[styles.ringContainer, { transform: [{ scale: splashScale }] }]}
        >
          <View style={[styles.ringCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <CircularProgress
              progress={progress}
              size={220}
              strokeWidth={14}
              color={colors.tint}
              trackColor={isDark ? colors.borderLight : "#EEF2F5"}
            >
              <Droplets size={28} color={colors.tint} style={{ marginBottom: 4 }} />
              <Text style={[styles.progressAmount, { color: colors.text }]}>
                {fmt(total)}
              </Text>
              <Text style={[styles.progressUnit, { color: colors.textSecondary }]}>
                / {fmt(goal)} {unit}
              </Text>
              <Text
                style={[
                  styles.progressPercent,
                  {
                    color:
                      percentage >= 100 ? colors.success : colors.tint,
                  },
                ]}
              >
                {percentage}%
              </Text>
            </CircularProgress>
          </View>
        </Animated.View>

        {remaining > 0 ? (
          <Text style={[styles.remainingText, { color: colors.textSecondary }]}>
            {fmt(remaining)} {unit} remaining
          </Text>
        ) : (
          <Text style={[styles.remainingText, { color: colors.success }]}>
            Goal reached!
          </Text>
        )}

        {streak > 0 && (
          <View style={[styles.streakBadge, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Flame size={18} color="#FF9500" />
            <Text style={[styles.streakCount, { color: colors.text }]}>{streak}</Text>
            <Text style={[styles.streakLabel, { color: colors.textSecondary }]}>
              day{streak !== 1 ? 's' : ''} streak
            </Text>
          </View>
        )}

        <View style={styles.buttonsRow}>
          <View style={styles.addPair}>
            <RippleButton
              label={settings.unit === 'oz' ? '+8' : '+250'}
              sublabel={unit}
              onPress={() => handleAdd(settings.unit === 'oz' ? 237 : 250)}
              color={colors.tint}
            />
            <Pressable
              onPress={() => handleSubtract(settings.unit === 'oz' ? 237 : 250)}
              style={[styles.minusBtn, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}
              testID="minus-btn-small"
            >
              <Minus size={16} color={colors.text} />
            </Pressable>
          </View>
          <View style={styles.addPair}>
            <RippleButton
              label={settings.unit === 'oz' ? '+16' : '+500'}
              sublabel={unit}
              onPress={() => handleAdd(settings.unit === 'oz' ? 473 : 500)}
              color={colors.tint}
            />
            <Pressable
              onPress={() => handleSubtract(settings.unit === 'oz' ? 473 : 500)}
              style={[styles.minusBtn, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}
              testID="minus-btn-large"
            >
              <Minus size={16} color={colors.text} />
            </Pressable>
          </View>
          <View style={styles.addPair}>
            <RippleButton
              label="Custom"
              onPress={() => setCustomModalVisible(true)}
              color={isDark ? colors.surfaceSecondary : colors.surfaceSecondary}
              textColor={colors.text}
              style={{ borderWidth: 1, borderColor: colors.border }}
            />
            <View style={styles.minusSpacer} />
          </View>
        </View>

        <View style={[styles.verseCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.verseHeader}>
            <BookOpen size={14} color={colors.tint} />
            <Text style={[styles.verseHeaderText, { color: colors.tint }]}>Daily Verse</Text>
          </View>
          <Text style={[styles.verseText, { color: colors.text }]}>
            &ldquo;{dailyVerse.text}&rdquo;
          </Text>
          <Text style={[styles.verseRef, { color: colors.textSecondary }]}>
            — {dailyVerse.reference}
          </Text>
        </View>

        <View style={[styles.todaySummary, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.summaryTitle, { color: colors.text }]}>
            Today&apos;s Intake
          </Text>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryValue, { color: colors.tint }]}>
                {todayRecord.entries.length}
              </Text>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                drinks
              </Text>
            </View>
            <View style={[styles.summaryDivider, { backgroundColor: colors.border }]} />
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryValue, { color: colors.tint }]}>
                {fmt(total)}
              </Text>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                {unit} total
              </Text>
            </View>
            <View style={[styles.summaryDivider, { backgroundColor: colors.border }]} />
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryValue, { color: percentage >= 100 ? colors.success : colors.tint }]}>
                {percentage}%
              </Text>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                of goal
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <Modal
        visible={customModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setCustomModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setCustomModalVisible(false)}
        >
          <Pressable
            style={[styles.modalCard, { backgroundColor: colors.surface }]}
            onPress={() => {}}
          >
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Custom Amount
            </Text>
            <View style={[styles.inputRow, { borderColor: colors.border }]}>
              <TextInput
                style={[styles.input, { color: colors.text }, webInputReset]}
                placeholder="0"
                placeholderTextColor={colors.textTertiary}
                keyboardType="number-pad"
                value={customAmount}
                onChangeText={setCustomAmount}
                autoFocus
                testID="custom-amount-input"
              />
              <Text style={[styles.inputUnit, { color: colors.textSecondary }]}>
                {unit}
              </Text>
            </View>
            <View style={styles.modalButtons}>
              <Pressable
                onPress={() => setCustomModalVisible(false)}
                style={[styles.modalBtn, { backgroundColor: colors.surfaceSecondary }]}
              >
                <Text style={[styles.modalBtnText, { color: colors.text }]}>
                  Cancel
                </Text>
              </Pressable>
              <Pressable
                onPress={handleCustomSubmit}
                style={[styles.modalBtn, { backgroundColor: colors.tint }]}
              >
                <Text style={[styles.modalBtnText, { color: "#FFF" }]}>
                  Add
                </Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 32,
  },
  greeting: {
    fontSize: 14,
    fontWeight: "500" as const,
    letterSpacing: 0.2,
  },
  title: {
    fontSize: 28,
    fontWeight: "800" as const,
    letterSpacing: -0.8,
    marginTop: 2,
  },
  soundBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  ringContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  ringCard: {
    width: 260,
    height: 260,
    borderRadius: 130,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  progressAmount: {
    fontSize: 36,
    fontWeight: "800" as const,
    letterSpacing: -1,
  },
  progressUnit: {
    fontSize: 13,
    fontWeight: "500" as const,
    marginTop: -2,
  },
  progressPercent: {
    fontSize: 14,
    fontWeight: "700" as const,
    marginTop: 4,
  },
  remainingText: {
    textAlign: "center",
    fontSize: 14,
    fontWeight: "500" as const,
    marginBottom: 20,
  },
  streakBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
    marginBottom: 24,
  },
  streakCount: {
    fontSize: 18,
    fontWeight: "800" as const,
    letterSpacing: -0.5,
  },
  streakLabel: {
    fontSize: 13,
    fontWeight: "500" as const,
  },
  buttonsRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 28,
  },
  addPair: {
    alignItems: "center",
    gap: 8,
  },
  minusBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  minusSpacer: {
    height: 32,
  },
  verseCard: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    marginBottom: 16,
  },
  verseHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 12,
  },
  verseHeaderText: {
    fontSize: 12,
    fontWeight: "700" as const,
    letterSpacing: 0.8,
    textTransform: "uppercase" as const,
  },
  verseText: {
    fontSize: 15,
    fontWeight: "400" as const,
    lineHeight: 24,
    fontStyle: "italic" as const,
    marginBottom: 10,
  },
  verseRef: {
    fontSize: 13,
    fontWeight: "600" as const,
    textAlign: "right" as const,
  },
  todaySummary: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
  },
  summaryTitle: {
    fontSize: 15,
    fontWeight: "600" as const,
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  summaryItem: {
    flex: 1,
    alignItems: "center",
  },
  summaryValue: {
    fontSize: 22,
    fontWeight: "700" as const,
    letterSpacing: -0.5,
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: "500" as const,
    marginTop: 2,
  },
  summaryDivider: {
    width: 1,
    height: 32,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  modalCard: {
    width: "100%",
    borderRadius: 20,
    padding: 24,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    marginBottom: 20,
    textAlign: "center",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 20,
    overflow: "hidden",
  },
  input: {
    flex: 1,
    fontSize: 28,
    fontWeight: "700" as const,
    letterSpacing: -0.5,
    minWidth: 0,
  },
  inputUnit: {
    fontSize: 16,
    fontWeight: "500" as const,
    marginLeft: 8,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  modalBtnText: {
    fontSize: 15,
    fontWeight: "600" as const,
  },
});
