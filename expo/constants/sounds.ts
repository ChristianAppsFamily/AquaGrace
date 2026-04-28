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
    url: "https://assets.mixkit.co/active_storage/sfx/2017/2017-preview.mp3",
  },
  {
    id: "splash",
    label: "Splash",
    url: "https://assets.mixkit.co/active_storage/sfx/2014/2014-preview.mp3",
  },
  {
    id: "pop",
    label: "Pop",
    url: "https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3",
  },
  {
    id: "chime",
    label: "Chime",
    url: "https://assets.mixkit.co/active_storage/sfx/1822/1822-preview.mp3",
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
