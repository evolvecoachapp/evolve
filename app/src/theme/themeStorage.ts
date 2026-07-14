import AsyncStorage from "@react-native-async-storage/async-storage";
import type { ThemePreference } from "./themePreference";

const THEME_PREFERENCE_KEY = "evolve.theme.preference";

export async function getStoredThemePreference(): Promise<ThemePreference | null> {
  try {
    const value = await AsyncStorage.getItem(THEME_PREFERENCE_KEY);
    if (value === "system" || value === "light" || value === "dark") {
      return value;
    }
    return null;
  } catch {
    return null;
  }
}

export async function setStoredThemePreference(preference: ThemePreference): Promise<void> {
  await AsyncStorage.setItem(THEME_PREFERENCE_KEY, preference);
}
