import { Check } from "lucide-react-native";
import React, { useCallback, useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Colors from "@/constants/colors";
import { useWater } from "@/providers/WaterProvider";
import { formatAmount, unitLabel } from "@/types/water";

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function StatsScreen() {
  const insets = useSafeAreaInsets();
  const { getLast7Days, settings, records, streak } = useWater();
  const unit = unitLabel(settings.unit);
  const isDark = settings.darkMode;
  const colors = isDark ? Colors.dark : Colors.light;
  const [selectedBar, setSelectedBar] = useState<number | null>(null);

  const last7 = useMemo(() => getLast7Days(), [getLast7Days]);
  const maxAmount = useMemo(
    () => Math.max(settings.goalMl, ...last7.map((d) => d.totalMl)),
    [last7, settings.goalMl]
  );

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const calendarDays = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth, 1);
    let startDay = firstDay.getDay() - 1;
    if (startDay < 0) startDay = 6;
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    const days: ({ day: number; dateKey: string } | null)[] = [];
    for (let i = 0; i < startDay; i++) {
      days.push(null);
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const dateKey = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      days.push({ day: d, dateKey });
    }
    return days;
  }, [currentMonth, currentYear]);

  const getDayLabel = useCallback((dateStr: string) => {
    const d = new Date(dateStr + "T00:00:00");
    const dayIndex = d.getDay();
    return DAY_LABELS[dayIndex === 0 ? 6 : dayIndex - 1];
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
        <Text style={[styles.title, { color: colors.text }]}>Statistics</Text>

        <View style={[styles.streakCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.streakInner}>
            <Text style={styles.streakEmoji}>{streak > 0 ? '🔥' : '💧'}</Text>
            <View>
              <Text style={[styles.streakValue, { color: colors.text }]}>{streak}</Text>
              <Text style={[styles.streakSubtext, { color: colors.textSecondary }]}>day streak</Text>
            </View>
          </View>
          <View style={[styles.streakDivider, { backgroundColor: colors.border }]} />
          <View style={styles.streakInner}>
            <Text style={styles.streakEmoji}>🎯</Text>
            <View>
              <Text style={[styles.streakValue, { color: colors.text }]}>
                {Object.values(records).filter(r => r.goalMet).length}
              </Text>
              <Text style={[styles.streakSubtext, { color: colors.textSecondary }]}>goals met</Text>
            </View>
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Last 7 Days
          </Text>
          <View style={styles.chartContainer}>
            <View style={styles.goalLine}>
              <View style={[styles.goalDash, { backgroundColor: colors.tint }]} />
              <Text style={[styles.goalLabel, { color: colors.tintMedium }]}>
                {formatAmount(settings.goalMl, settings.unit)}{unit}
              </Text>
            </View>
            <View style={styles.barsRow}>
              {last7.map((day, idx) => {
                const height = maxAmount > 0 ? (day.totalMl / maxAmount) * 140 : 0;
                const isSelected = selectedBar === idx;
                const metGoal = day.totalMl >= settings.goalMl;
                return (
                  <Pressable
                    key={day.date}
                    onPress={() => setSelectedBar(isSelected ? null : idx)}
                    style={styles.barCol}
                  >
                    {isSelected && (
                      <View style={[styles.tooltip, { backgroundColor: colors.text }]}>
                        <Text style={[styles.tooltipText, { color: colors.background }]}>
                          {formatAmount(day.totalMl, settings.unit)}{unit}
                        </Text>
                      </View>
                    )}
                    <View style={styles.barWrapper}>
                      <View
                        style={[
                          styles.bar,
                          {
                            height: Math.max(height, 4),
                            backgroundColor: metGoal ? colors.tint : isDark ? colors.borderLight : "#D8DEE4",
                            borderRadius: 6,
                          },
                        ]}
                      />
                    </View>
                    <Text style={[styles.dayLabel, { color: colors.textSecondary }]}>
                      {getDayLabel(day.date)}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {MONTH_NAMES[currentMonth]} {currentYear}
          </Text>
          <View style={styles.calendarHeader}>
            {DAY_LABELS.map((label) => (
              <View key={label} style={styles.calendarHeaderCell}>
                <Text style={[styles.calendarHeaderText, { color: colors.textTertiary }]}>
                  {label}
                </Text>
              </View>
            ))}
          </View>
          <View style={styles.calendarGrid}>
            {calendarDays.map((item, idx) => {
              if (!item) {
                return <View key={`empty-${idx}`} style={styles.calendarCell} />;
              }
              const record = records[item.dateKey];
              const isToday = item.day === now.getDate();
              const isFuture = item.day > now.getDate();
              const metGoal = record ? record.goalMet : false;

              return (
                <View key={item.dateKey} style={styles.calendarCell}>
                  <View
                    style={[
                      styles.calendarDot,
                      isToday && { borderWidth: 2, borderColor: colors.tint },
                      metGoal && { backgroundColor: colors.tint },
                      !metGoal && !isFuture && !isToday && {
                        backgroundColor: isDark ? colors.borderLight : "#EAECEF",
                      },
                      isFuture && { backgroundColor: "transparent" },
                    ]}
                  >
                    {metGoal ? (
                      <Check size={12} color="#FFF" strokeWidth={3} />
                    ) : !isFuture && record && record.totalMl > 0 ? (
                      <Text style={[styles.calendarDayNum, { color: colors.textSecondary, fontSize: 10 }]}>
                        {Math.round((record.totalMl / settings.goalMl) * 100)}%
                      </Text>
                    ) : (
                      <Text
                        style={[
                          styles.calendarDayNum,
                          { color: isFuture ? colors.textTertiary : colors.textSecondary },
                        ]}
                      >
                        {item.day}
                      </Text>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
          <View style={styles.legendRow}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDotBlue, { backgroundColor: colors.tint }]} />
              <Text style={[styles.legendText, { color: colors.textSecondary }]}>Goal met</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDotGray, { backgroundColor: isDark ? colors.borderLight : "#EAECEF" }]} />
              <Text style={[styles.legendText, { color: colors.textSecondary }]}>Missed</Text>
            </View>
          </View>
        </View>
      </ScrollView>
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
    marginBottom: 20,
  },
  streakCard: {
    flexDirection: "row" as const,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    marginBottom: 16,
    alignItems: "center" as const,
  },
  streakInner: {
    flex: 1,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 10,
    justifyContent: "center" as const,
  },
  streakDivider: {
    width: 1,
    height: 36,
  },
  streakEmoji: {
    fontSize: 26,
  },
  streakValue: {
    fontSize: 22,
    fontWeight: "800" as const,
    letterSpacing: -0.5,
  },
  streakSubtext: {
    fontSize: 12,
    fontWeight: "500" as const,
  },
  card: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700" as const,
    marginBottom: 16,
  },
  chartContainer: {
    position: "relative",
  },
  goalLine: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  goalDash: {
    flex: 1,
    height: 1,
    opacity: 0.3,
  },
  goalLabel: {
    fontSize: 11,
    fontWeight: "600" as const,
    marginLeft: 8,
  },
  barsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    height: 160,
    paddingTop: 16,
  },
  barCol: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
  },
  barWrapper: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    width: "100%",
  },
  bar: {
    width: 28,
    minHeight: 4,
  },
  dayLabel: {
    fontSize: 11,
    fontWeight: "500" as const,
    marginTop: 8,
  },
  tooltip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 6,
  },
  tooltipText: {
    fontSize: 12,
    fontWeight: "700" as const,
  },
  calendarHeader: {
    flexDirection: "row",
    marginBottom: 8,
  },
  calendarHeaderCell: {
    flex: 1,
    alignItems: "center",
  },
  calendarHeaderText: {
    fontSize: 11,
    fontWeight: "600" as const,
  },
  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  calendarCell: {
    width: "14.28%",
    alignItems: "center",
    paddingVertical: 4,
  },
  calendarDot: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  calendarDayNum: {
    fontSize: 12,
    fontWeight: "600" as const,
  },
  legendRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 20,
    marginTop: 16,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  legendDotBlue: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendDotGray: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 12,
    fontWeight: "500" as const,
  },
});
