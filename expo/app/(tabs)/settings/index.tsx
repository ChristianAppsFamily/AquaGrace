import { useAudioPlayer } from "expo-audio";
import { Bell, ChevronRight, Clock, Droplets, Moon, Music, Ruler, Sparkles, Sun, Volume2 } from "lucide-react-native";
import React, { useCallback, useMemo, useState } from "react";
import {
  Alert,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Colors from "@/constants/colors";
import { DRINK_SOUNDS, getDrinkSoundUrl } from "@/constants/sounds";
import { useWater } from "@/providers/WaterProvider";
import { DrinkSoundId, UnitType, formatAmount, unitLabel, to12Hour, from12Hour } from "@/types/water";

const webInputReset = Platform.OS === "web"
  ? ({ outlineStyle: "none", outlineWidth: 0, outlineColor: "transparent" } as unknown as object)
  : null;

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { settings, updateSettings } = useWater();
  const isDark = settings.darkMode;
  const colors = isDark ? Colors.dark : Colors.light;

  const [goalModalVisible, setGoalModalVisible] = useState<boolean>(false);
  const [goalInput, setGoalInput] = useState<string>(String(settings.goalMl));
  const [timeModalVisible, setTimeModalVisible] = useState<boolean>(false);
  const [editingTime, setEditingTime] = useState<"wake" | "sleep">("wake");
  const [timeInput, setTimeInput] = useState<string>("");

  const handleSaveGoal = useCallback(() => {
    const val = parseInt(goalInput, 10);
    if (settings.unit === 'oz') {
      if (val >= 16 && val <= 340) {
        updateSettings({ goalMl: Math.round(val * 29.5735) });
        setGoalModalVisible(false);
      } else {
        Alert.alert("Invalid", "Please enter a value between 16 and 340 oz.");
      }
    } else {
      if (val >= 500 && val <= 10000) {
        updateSettings({ goalMl: val });
        setGoalModalVisible(false);
      } else {
        Alert.alert("Invalid", "Please enter a value between 500 and 10000 ml.");
      }
    }
  }, [goalInput, updateSettings, settings.unit]);

  const handleOpenTime = useCallback(
    (type: "wake" | "sleep") => {
      setEditingTime(type);
      const current = type === "wake" ? settings.wakeTime : settings.sleepTime;
      setTimeInput(to12Hour(current));
      setTimeModalVisible(true);
    },
    [settings.wakeTime, settings.sleepTime]
  );

  const previewSoundUrl = useMemo(
    () => getDrinkSoundUrl(settings.drinkSound),
    [settings.drinkSound]
  );
  const previewSource = useMemo(
    () => (previewSoundUrl ? { uri: previewSoundUrl } : null),
    [previewSoundUrl]
  );
  const previewPlayer = useAudioPlayer(previewSource);

  const handleSelectSound = useCallback(
    (id: DrinkSoundId) => {
      updateSettings({ drinkSound: id });
      const url = getDrinkSoundUrl(id);
      if (!url) return;
      try {
        previewPlayer.replace({ uri: url });
        previewPlayer.seekTo(0);
        previewPlayer.play();
      } catch (err) {
        console.log("[AquaGrace] Preview sound error", err);
      }
    },
    [updateSettings, previewPlayer]
  );

  const handleSaveTime = useCallback(() => {
    const formatted = from12Hour(timeInput);
    if (formatted) {
      if (editingTime === "wake") {
        updateSettings({ wakeTime: formatted });
      } else {
        updateSettings({ sleepTime: formatted });
      }
      setTimeModalVisible(false);
    } else {
      Alert.alert("Invalid", "Please enter time in 12-hour format (e.g., 7:00 AM).");
    }
  }, [timeInput, editingTime, updateSettings]);

  const handleRemoveAds = useCallback(() => {
    console.log("[AquaGrace] Remove Ads pressed");
    Alert.alert(
      "Remove Ads",
      "Purchases are not available yet. Please check back soon!",
      [{ text: "OK" }]
    );
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.title, { color: colors.text }]}>Settings</Text>

        <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
          HYDRATION
        </Text>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Pressable
            style={styles.row}
            onPress={() => {
              setGoalInput(String(formatAmount(settings.goalMl, settings.unit)));
              setGoalModalVisible(true);
            }}
            testID="goal-setting"
          >
            <View style={styles.rowLeft}>
              <View style={[styles.iconBox, { backgroundColor: colors.tintLight }]}>
                <Droplets size={18} color={colors.tint} />
              </View>
              <View>
                <Text style={[styles.rowTitle, { color: colors.text }]}>
                  Daily Goal
                </Text>
                <Text style={[styles.rowValue, { color: colors.textSecondary }]}>
                  {formatAmount(settings.goalMl, settings.unit)} {unitLabel(settings.unit)}
                </Text>
              </View>
            </View>
            <ChevronRight size={18} color={colors.textTertiary} />
          </Pressable>
        </View>

        <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
          UNITS
        </Text>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <View style={[styles.iconBox, { backgroundColor: "#E8F5E9" }]}>
                <Ruler size={18} color="#43A047" />
              </View>
              <Text style={[styles.rowTitle, { color: colors.text }]}>
                Measurement Unit
              </Text>
            </View>
          </View>
          <View style={styles.unitToggleRow}>
            {(['ml', 'oz'] as UnitType[]).map((u) => (
              <Pressable
                key={u}
                onPress={() => updateSettings({ unit: u })}
                style={[
                  styles.unitOption,
                  {
                    backgroundColor: settings.unit === u ? colors.tint : colors.surfaceSecondary,
                    borderColor: settings.unit === u ? colors.tint : colors.border,
                  },
                ]}
                testID={`unit-${u}`}
              >
                <Text
                  style={[
                    styles.unitOptionText,
                    { color: settings.unit === u ? '#FFF' : colors.text },
                  ]}
                >
                  {u === 'ml' ? 'Milliliters (ml)' : 'Ounces (oz)'}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
          DRINK SOUND
        </Text>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <View style={[styles.iconBox, { backgroundColor: colors.tintLight }]}>
                <Volume2 size={18} color={colors.tint} />
              </View>
              <View>
                <Text style={[styles.rowTitle, { color: colors.text }]}>
                  Add Drink Sound
                </Text>
                <Text style={[styles.rowValue, { color: colors.textSecondary }]}>
                  Plays when you log water
                </Text>
              </View>
            </View>
          </View>
          <View style={styles.soundList}>
            {DRINK_SOUNDS.map((sound) => {
              const active = settings.drinkSound === sound.id;
              return (
                <Pressable
                  key={sound.id}
                  onPress={() => handleSelectSound(sound.id)}
                  style={[
                    styles.soundChip,
                    {
                      backgroundColor: active ? colors.tint : colors.surfaceSecondary,
                      borderColor: active ? colors.tint : colors.border,
                    },
                  ]}
                  testID={`drink-sound-${sound.id}`}
                >
                  <Music
                    size={14}
                    color={active ? "#FFF" : colors.textSecondary}
                  />
                  <Text
                    style={[
                      styles.soundChipText,
                      { color: active ? "#FFF" : colors.text },
                    ]}
                  >
                    {sound.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
          SCHEDULE
        </Text>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Pressable style={styles.row} onPress={() => handleOpenTime("wake")}>
            <View style={styles.rowLeft}>
              <View style={[styles.iconBox, { backgroundColor: "#FFF3E0" }]}>
                <Sun size={18} color="#FB8C00" />
              </View>
              <View>
                <Text style={[styles.rowTitle, { color: colors.text }]}>
                  Wake Time
                </Text>
                <Text style={[styles.rowValue, { color: colors.textSecondary }]}>
                  {to12Hour(settings.wakeTime)}
                </Text>
              </View>
            </View>
            <ChevronRight size={18} color={colors.textTertiary} />
          </Pressable>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <Pressable style={styles.row} onPress={() => handleOpenTime("sleep")}>
            <View style={styles.rowLeft}>
              <View style={[styles.iconBox, { backgroundColor: "#E8EAF6" }]}>
                <Moon size={18} color="#5C6BC0" />
              </View>
              <View>
                <Text style={[styles.rowTitle, { color: colors.text }]}>
                  Sleep Time
                </Text>
                <Text style={[styles.rowValue, { color: colors.textSecondary }]}>
                  {to12Hour(settings.sleepTime)}
                </Text>
              </View>
            </View>
            <ChevronRight size={18} color={colors.textTertiary} />
          </Pressable>
        </View>

        <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
          REMINDERS
        </Text>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <View style={[styles.iconBox, { backgroundColor: "#E3F2FD" }]}>
                <Bell size={18} color={colors.tint} />
              </View>
              <View>
                <Text style={[styles.rowTitle, { color: colors.text }]}>
                  Reminder Times
                </Text>
                <Text style={[styles.rowValue, { color: colors.textSecondary }]}>
                  {settings.reminders.length} daily reminders
                </Text>
              </View>
            </View>
          </View>
          <View style={styles.reminderChips}>
            {settings.reminders.map((time) => (
              <View
                key={time}
                style={[
                  styles.chip,
                  { backgroundColor: colors.surfaceSecondary, borderColor: colors.border },
                ]}
              >
                <Clock size={12} color={colors.textSecondary} />
                <Text style={[styles.chipText, { color: colors.text }]}>
                  {to12Hour(time)}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
          APPEARANCE
        </Text>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <View style={[styles.iconBox, { backgroundColor: isDark ? "#2C2C2E" : "#F3F3F7" }]}>
                <Moon size={18} color={isDark ? "#A0A0A5" : "#636366"} />
              </View>
              <Text style={[styles.rowTitle, { color: colors.text }]}>
                Dark Mode
              </Text>
            </View>
            <Switch
              value={settings.darkMode}
              onValueChange={(val) => updateSettings({ darkMode: val })}
              trackColor={{ false: "#D1D1D6", true: colors.tint }}
              thumbColor="#FFFFFF"
              testID="dark-mode-switch"
            />
          </View>
        </View>

        <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
          UPGRADE
        </Text>
        <Pressable
          onPress={handleRemoveAds}
          style={({ pressed }) => [
            styles.removeAdsCard,
            {
              backgroundColor: colors.tint,
              opacity: pressed ? 0.9 : 1,
            },
          ]}
          testID="remove-ads-button"
        >
          <View style={styles.removeAdsLeft}>
            <View style={styles.removeAdsIconBox}>
              <Sparkles size={20} color="#FFF" />
            </View>
            <View>
              <Text style={styles.removeAdsTitle}>Remove Ads</Text>
              <Text style={styles.removeAdsSubtitle}>
                Enjoy AquaGrace ad-free, forever
              </Text>
            </View>
          </View>
          <View style={styles.removeAdsPriceBox}>
            <Text style={styles.removeAdsPrice}>$3.99</Text>
          </View>
        </Pressable>

        <Text style={[styles.footerText, { color: colors.textTertiary }]}>
          AquaGrace v1.0 · Stay hydrated
        </Text>
      </ScrollView>

      <Modal
        visible={goalModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setGoalModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setGoalModalVisible(false)}
        >
          <Pressable style={[styles.modalCard, { backgroundColor: colors.surface }]} onPress={() => {}}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Daily Goal
            </Text>
            <View style={[styles.inputRow, { borderColor: colors.border }]}>
              <TextInput
                style={[styles.input, { color: colors.text }, webInputReset]}
                placeholder="2000"
                placeholderTextColor={colors.textTertiary}
                keyboardType="number-pad"
                value={goalInput}
                onChangeText={setGoalInput}
                autoFocus
                testID="goal-input"
              />
              <Text style={[styles.inputUnit, { color: colors.textSecondary }]}>
                {unitLabel(settings.unit)}
              </Text>
            </View>
            <View style={styles.modalButtons}>
              <Pressable
                onPress={() => setGoalModalVisible(false)}
                style={[styles.modalBtn, { backgroundColor: colors.surfaceSecondary }]}
              >
                <Text style={[styles.modalBtnText, { color: colors.text }]}>Cancel</Text>
              </Pressable>
              <Pressable
                onPress={handleSaveGoal}
                style={[styles.modalBtn, { backgroundColor: colors.tint }]}
              >
                <Text style={[styles.modalBtnText, { color: "#FFF" }]}>Save</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal
        visible={timeModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setTimeModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setTimeModalVisible(false)}
        >
          <Pressable style={[styles.modalCard, { backgroundColor: colors.surface }]} onPress={() => {}}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {editingTime === "wake" ? "Wake Time" : "Sleep Time"}
            </Text>
            <View style={[styles.inputRow, { borderColor: colors.border }]}>
              <TextInput
                style={[styles.input, { color: colors.text }, webInputReset]}
                placeholder="7:00 AM"
                placeholderTextColor={colors.textTertiary}
                keyboardType="default"
                value={timeInput}
                onChangeText={setTimeInput}
                autoFocus
                testID="time-input"
              />
            </View>
            <Text style={[styles.inputHint, { color: colors.textTertiary }]}>
              Use 12h format (e.g., 7:00 AM or 11:00 PM)
            </Text>
            <View style={styles.modalButtons}>
              <Pressable
                onPress={() => setTimeModalVisible(false)}
                style={[styles.modalBtn, { backgroundColor: colors.surfaceSecondary }]}
              >
                <Text style={[styles.modalBtnText, { color: colors.text }]}>Cancel</Text>
              </Pressable>
              <Pressable
                onPress={handleSaveTime}
                style={[styles.modalBtn, { backgroundColor: colors.tint }]}
              >
                <Text style={[styles.modalBtnText, { color: "#FFF" }]}>Save</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "800" as const,
    letterSpacing: -0.8,
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "600" as const,
    letterSpacing: 0.8,
    marginBottom: 8,
    marginLeft: 4,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 24,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: "600" as const,
  },
  rowValue: {
    fontSize: 13,
    fontWeight: "400" as const,
    marginTop: 1,
  },
  divider: {
    height: 1,
    marginLeft: 64,
  },
  reminderChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 13,
    fontWeight: "500" as const,
    fontVariant: ["tabular-nums" as const],
  },
  unitToggleRow: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  unitOption: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
  },
  unitOptionText: {
    fontSize: 14,
    fontWeight: "600" as const,
  },
  footerText: {
    textAlign: "center",
    fontSize: 12,
    fontWeight: "400" as const,
    marginTop: 8,
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
    marginBottom: 12,
    overflow: "hidden",
  },
  input: {
    flex: 1,
    fontSize: 28,
    fontWeight: "700" as const,
    letterSpacing: -0.5,
    minWidth: 0,
  },
  soundList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  soundChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  soundChipText: {
    fontSize: 13,
    fontWeight: "600" as const,
  },
  inputUnit: {
    fontSize: 16,
    fontWeight: "500" as const,
    marginLeft: 8,
  },
  inputHint: {
    fontSize: 12,
    textAlign: "center",
    marginBottom: 16,
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
  removeAdsCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  removeAdsLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  removeAdsIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.22)",
  },
  removeAdsTitle: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#FFF",
    letterSpacing: -0.2,
  },
  removeAdsSubtitle: {
    fontSize: 12,
    fontWeight: "500" as const,
    color: "rgba(255,255,255,0.85)",
    marginTop: 2,
  },
  removeAdsPriceBox: {
    backgroundColor: "rgba(255,255,255,0.22)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  removeAdsPrice: {
    fontSize: 15,
    fontWeight: "800" as const,
    color: "#FFF",
    letterSpacing: -0.2,
  },
});
