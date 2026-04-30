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

export type DrinkSoundId = 'drop' | 'splash' | 'pop' | 'chime' | 'none';

export interface UserSettings {
  goalMl: number;
  wakeTime: string;
  sleepTime: string;
  darkMode: boolean;
  reminders: string[];
  unit: UnitType;
  drinkSound: DrinkSoundId;
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
  unit: 'oz',
  drinkSound: 'drop',
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

export function to12Hour(time24: string): string {
  const match = time24.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return time24;
  const h = parseInt(match[1], 10);
  const m = match[2];
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${m} ${period}`;
}

export function from12Hour(time12: string): string | null {
  const trimmed = time12.trim().toUpperCase();
  const match = trimmed.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/);
  if (!match) return null;
  let h = parseInt(match[1], 10);
  const m = parseInt(match[2], 10);
  const period = match[3];
  if (h < 1 || h > 12 || m < 0 || m > 59) return null;
  if (period === "AM") {
    h = h === 12 ? 0 : h;
  } else {
    h = h === 12 ? 12 : h + 12;
  }
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}
