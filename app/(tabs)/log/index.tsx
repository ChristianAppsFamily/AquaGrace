import * as Haptics from "expo-haptics";
import { Droplets, Trash2 } from "lucide-react-native";
import React, { useCallback, useRef } from "react";
import {
  Animated,
  PanResponder,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Colors from "@/constants/colors";
import { useWater } from "@/providers/WaterProvider";
import { to12Hour } from "@/types/water";

interface TimelineEntryProps {
  entry: { id: string; time: string; amount: number };
  onDelete: (id: string) => void;
  isDark: boolean;
  displayAmount: string;
  unitStr: string;
}

function TimelineEntry({
  entry,
  onDelete,
  isDark,
  displayAmount,
  unitStr,
}: TimelineEntryProps) {
  const colors = isDark ? Colors.dark : Colors.light;
  const translateX = useRef(new Animated.Value(0)).current;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) =>
        Math.abs(gestureState.dx) > 10 && Math.abs(gestureState.dx) > Math.abs(gestureState.dy),
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dx < 0) {
          translateX.setValue(Math.max(gestureState.dx, -80));
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx < -50) {
          Animated.spring(translateX, {
            toValue: -80,
            useNativeDriver: true,
          }).start();
        } else {
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  const handleDelete = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Animated.timing(translateX, {
      toValue: -400,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      onDelete(entry.id);
    });
  }, [entry.id, onDelete, translateX]);

  return (
    <View style={styles.entryWrapper}>
      <View style={styles.deleteContainer}>
        <Pressable onPress={handleDelete} style={styles.deleteBtn}>
          <Trash2 size={18} color="#FFF" />
        </Pressable>
      </View>
      <Animated.View
        style={[
          styles.entryRow,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            transform: [{ translateX }],
          },
        ]}
        {...panResponder.panHandlers}
      >
        <View style={styles.entryLeft}>
          <View
            style={[
              styles.timelineDot,
              { backgroundColor: colors.tint },
            ]}
          />
          <Text style={[styles.entryTime, { color: colors.textSecondary }]}>
            {to12Hour(entry.time)}
          </Text>
        </View>
        <View style={styles.entryRight}>
          <Droplets size={16} color={colors.tint} />
          <Text style={[styles.entryAmount, { color: colors.text }]}>
            {displayAmount} {unitStr}
          </Text>
        </View>
      </Animated.View>
    </View>
  );
}

export default function LogScreen() {
  const insets = useSafeAreaInsets();
  const { todayRecord, removeEntry, settings, formatAmount: fmt, unitLabel: getUnit } = useWater();
  const unit = getUnit();
  const isDark = settings.darkMode;
  const colors = isDark ? Colors.dark : Colors.light;

  const entries = [...todayRecord.entries].reverse();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Text style={[styles.title, { color: colors.text }]}>Today&apos;s Log</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          {todayRecord.entries.length} entries · {fmt(todayRecord.totalMl)} {unit}
        </Text>
      </View>

      {entries.length === 0 ? (
        <View style={styles.emptyState}>
          <Droplets size={48} color={colors.border} />
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            No water logged yet today
          </Text>
          <Text style={[styles.emptyHint, { color: colors.textTertiary }]}>
            Go to Home and tap to add water
          </Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: insets.bottom + 100 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.timelineLine, { backgroundColor: colors.border }]} />
          {entries.map((entry) => (
            <TimelineEntry
              key={entry.id}
              entry={entry}
              onDelete={removeEntry}
              isDark={isDark}
              displayAmount={fmt(entry.amount)}
              unitStr={unit}
            />
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "800" as const,
    letterSpacing: -0.8,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: "500" as const,
    marginTop: 4,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  timelineLine: {
    position: "absolute",
    left: 38,
    top: 8,
    bottom: 0,
    width: 2,
    borderRadius: 1,
  },
  entryWrapper: {
    marginBottom: 10,
    overflow: "hidden",
    borderRadius: 16,
  },
  deleteContainer: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: 80,
    backgroundColor: "#FF3B30",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  deleteBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  entryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  entryLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  entryTime: {
    fontSize: 15,
    fontWeight: "600" as const,
    fontVariant: ["tabular-nums" as const],
  },
  entryRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  entryAmount: {
    fontSize: 17,
    fontWeight: "700" as const,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 80,
    gap: 8,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600" as const,
    marginTop: 12,
  },
  emptyHint: {
    fontSize: 13,
    fontWeight: "400" as const,
  },
});
