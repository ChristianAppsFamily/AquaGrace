import { DrinkSoundId } from "@/types/water";

export interface DrinkSoundOption {
  id: DrinkSoundId;
  label: string;
  url: string | null;
}

export const DRINK_SOUNDS: DrinkSoundOption[] = [
  {
    id: "drop",
    label: "Water Drop",
    url: "https://actions.google.com/sounds/v1/water/water_droplet.ogg",
  },
  {
    id: "splash",
    label: "Splash",
    url: "https://actions.google.com/sounds/v1/water/water_dripping.ogg",
  },
  {
    id: "pop",
    label: "Pop",
    url: "https://actions.google.com/sounds/v1/cartoon/pop.ogg",
  },
  {
    id: "chime",
    label: "Chime",
    url: "https://actions.google.com/sounds/v1/alarms/digital_watch_alarm_long.ogg",
  },
  {
    id: "none",
    label: "None",
    url: null,
  },
];

export function getDrinkSoundUrl(id: DrinkSoundId): string | null {
  const found = DRINK_SOUNDS.find((s) => s.id === id);
  return found ? found.url : null;
}
