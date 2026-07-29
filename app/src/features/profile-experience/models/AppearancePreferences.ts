export const ThemeModeValues = {
  LIGHT: "light",
  DARK: "dark",
  SYSTEM: "system",
} as const;

export type ThemeMode = (typeof ThemeModeValues)[keyof typeof ThemeModeValues];

export interface AppearancePreferences {
  readonly theme: ThemeMode;
  readonly accentColor: string | null;
  readonly destination: string | null;
}

export function createAppearancePreferences(input: AppearancePreferences): AppearancePreferences {
  return Object.freeze({ ...input });
}
