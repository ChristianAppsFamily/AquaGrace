export interface WaterEntry {
  id: string;
  time: string;
  amount: number;
}

export interface DailyRecord {
  date: string;
  totalMl: number;
  entries: WaterEntry[];
  goalMet: boolean;
}

export type UnitType = 'ml' | 'oz';

export interface UserSettings {
  goalMl: number;
  wakeTime: string;
  sleepTime: string;
  darkMode: boolean;
  reminders: string[];
  unit: UnitType;
}

export interface WaterState {
  settings: UserSettings;
  records: Record<string, DailyRecord>;
}

export const DEFAULT_SETTINGS: UserSettings = {
  goalMl: 2000,
  wakeTime: "07:00",
  sleepTime: "23:00",
  darkMode: false,
  reminders: [
    "08:00", "09:30", "11:00", "12:30",
    "14:00", "15:30", "17:00", "19:00",
  ],
  unit: 'ml',
};

const ML_PER_OZ = 29.5735;

export function mlToOz(ml: number): number {
  return Math.round(ml / ML_PER_OZ * 10) / 10;
}

export function ozToMl(oz: number): number {
  return Math.round(oz * ML_PER_OZ);
}

export function formatAmount(ml: number, unit: UnitType): string {
  if (unit === 'oz') return `${mlToOz(ml)}`;
  return `${ml}`;
}

export function unitLabel(unit: UnitType): string {
  return unit === 'oz' ? 'oz' : 'ml';
}

export function getTodayKey(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}
