/** User-selectable theme preference — may differ from resolved runtime mode. */
export type ThemePreference = "system" | "light" | "dark";

export const THEME_PREFERENCE_OPTIONS: readonly {
  value: ThemePreference;
  label: string;
  description: string;
}[] = [
  {
    value: "system",
    label: "System",
    description: "Match your device appearance",
  },
  {
    value: "light",
    label: "Light",
    description: "Warm light surfaces",
  },
  {
    value: "dark",
    label: "Dark",
    description: "Layered dark surfaces",
  },
] as const;
