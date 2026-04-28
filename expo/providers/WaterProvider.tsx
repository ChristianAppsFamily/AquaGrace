import createContextHook from "@nkzw/create-context-hook";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState } from "react";

import {
  DailyRecord,
  DEFAULT_SETTINGS,
  formatAmount,
  generateId,
  getTodayKey,
  unitLabel,
  UserSettings,
  WaterEntry,
} from "@/types/water";

const SETTINGS_KEY = "aquaflow_settings";
const RECORDS_KEY = "aquaflow_records";

export const [WaterProvider, useWater] = createContextHook(() => {
  const queryClient = useQueryClient();
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [records, setRecords] = useState<Record<string, DailyRecord>>({});

  const settingsQuery = useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(SETTINGS_KEY);
      return stored ? (JSON.parse(stored) as UserSettings) : DEFAULT_SETTINGS;
    },
  });

  const recordsQuery = useQuery({
    queryKey: ["records"],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(RECORDS_KEY);
      return stored
        ? (JSON.parse(stored) as Record<string, DailyRecord>)
        : {};
    },
  });

  useEffect(() => {
    if (settingsQuery.data) {
      setSettings(settingsQuery.data);
    }
  }, [settingsQuery.data]);

  useEffect(() => {
    if (recordsQuery.data) {
      setRecords(recordsQuery.data);
    }
  }, [recordsQuery.data]);

  const { mutate: saveSettings } = useMutation({
    mutationFn: async (newSettings: UserSettings) => {
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));
      return newSettings;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
    },
  });

  const { mutate: saveRecords } = useMutation({
    mutationFn: async (newRecords: Record<string, DailyRecord>) => {
      await AsyncStorage.setItem(RECORDS_KEY, JSON.stringify(newRecords));
      return newRecords;
    },
  });

  const updateSettings = useCallback(
    (partial: Partial<UserSettings>) => {
      const updated = { ...settings, ...partial };
      setSettings(updated);
      saveSettings(updated);
    },
    [settings, saveSettings]
  );

  const todayKey = getTodayKey();

  const todayRecord = useMemo<DailyRecord>(() => {
    return (
      records[todayKey] ?? {
        date: todayKey,
        totalMl: 0,
        entries: [],
        goalMet: false,
      }
    );
  }, [records, todayKey]);

  const addWater = useCallback(
    (amount: number) => {
      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
      const entry: WaterEntry = {
        id: generateId(),
        time: timeStr,
        amount,
      };

      const current = records[todayKey] ?? {
        date: todayKey,
        totalMl: 0,
        entries: [],
        goalMet: false,
      };

      const newTotal = current.totalMl + amount;
      const updatedRecord: DailyRecord = {
        ...current,
        totalMl: newTotal,
        entries: [...current.entries, entry],
        goalMet: newTotal >= settings.goalMl,
      };

      const updatedRecords = { ...records, [todayKey]: updatedRecord };
      setRecords(updatedRecords);
      saveRecords(updatedRecords);
      console.log(`[AquaFlow] Added ${amount}ml. Total: ${newTotal}ml`);
    },
    [records, todayKey, settings.goalMl, saveRecords]
  );

  const subtractWater = useCallback(
    (amount: number) => {
      const current = records[todayKey];
      if (!current || current.entries.length === 0 || amount <= 0) return;

      let remaining = amount;
      const reversed = [...current.entries].reverse();
      const keptReversed: WaterEntry[] = [];
      for (const entry of reversed) {
        if (remaining <= 0) {
          keptReversed.push(entry);
          continue;
        }
        if (entry.amount <= remaining) {
          remaining -= entry.amount;
        } else {
          keptReversed.push({ ...entry, amount: entry.amount - remaining });
          remaining = 0;
        }
      }
      const newEntries = keptReversed.reverse();
      const newTotal = newEntries.reduce((sum, e) => sum + e.amount, 0);
      const updatedRecord: DailyRecord = {
        ...current,
        totalMl: newTotal,
        entries: newEntries,
        goalMet: newTotal >= settings.goalMl,
      };
      const updatedRecords = { ...records, [todayKey]: updatedRecord };
      setRecords(updatedRecords);
      saveRecords(updatedRecords);
      console.log(`[AquaGrace] Subtracted ${amount - remaining}ml. Total: ${newTotal}ml`);
    },
    [records, todayKey, settings.goalMl, saveRecords]
  );

  const removeEntry = useCallback(
    (entryId: string) => {
      const current = records[todayKey];
      if (!current) return;

      const entry = current.entries.find((e) => e.id === entryId);
      if (!entry) return;

      const newEntries = current.entries.filter((e) => e.id !== entryId);
      const newTotal = current.totalMl - entry.amount;
      const updatedRecord: DailyRecord = {
        ...current,
        totalMl: Math.max(0, newTotal),
        entries: newEntries,
        goalMet: Math.max(0, newTotal) >= settings.goalMl,
      };

      const updatedRecords = { ...records, [todayKey]: updatedRecord };
      setRecords(updatedRecords);
      saveRecords(updatedRecords);
      console.log(`[AquaFlow] Removed entry ${entryId}`);
    },
    [records, todayKey, settings.goalMl, saveRecords]
  );

  const getRecord = useCallback(
    (dateKey: string): DailyRecord | null => {
      return records[dateKey] ?? null;
    },
    [records]
  );

  const getLast7Days = useCallback((): DailyRecord[] => {
    const days: DailyRecord[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      days.push(
        records[key] ?? {
          date: key,
          totalMl: 0,
          entries: [],
          goalMet: false,
        }
      );
    }
    return days;
  }, [records]);

  const streak = useMemo(() => {
    let count = 0;
    const today = new Date();
    const todayStr = getTodayKey();
    const todayRec = records[todayStr];
    if (todayRec && todayRec.goalMet) {
      count = 1;
    }
    for (let i = 1; i <= 365; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      const rec = records[key];
      if (rec && rec.goalMet) {
        count++;
      } else {
        break;
      }
    }
    return count;
  }, [records]);

  const isLoading = settingsQuery.isLoading || recordsQuery.isLoading;

  return {
    settings,
    updateSettings,
    todayRecord,
    addWater,
    subtractWater,
    removeEntry,
    getRecord,
    getLast7Days,
    records,
    isLoading,
    streak,
    formatAmount: (ml: number) => formatAmount(ml, settings.unit),
    unitLabel: () => unitLabel(settings.unit),
  };
});

export function useTodayProgress() {
  const { todayRecord, settings } = useWater();
  return useMemo(() => {
    const progress = Math.min(todayRecord.totalMl / settings.goalMl, 1);
    const remaining = Math.max(settings.goalMl - todayRecord.totalMl, 0);
    return { progress, remaining, total: todayRecord.totalMl, goal: settings.goalMl };
  }, [todayRecord.totalMl, settings.goalMl]);
}
