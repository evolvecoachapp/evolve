import type { ColorPalette, ThemeMode } from "./colorTokens";
import { darkColors } from "./darkColors";
import { lightColors } from "./lightColors";
import { radius } from "./radius";
import { shadowPalettes } from "./shadows";
import { spacing } from "./spacing";
import { createTypography, type TypographyScale } from "./typography";

export interface ThemeTokens {
  colors: ColorPalette;
  typography: TypographyScale;
  spacing: typeof spacing;
  radius: typeof radius;
  shadows: (typeof shadowPalettes)["light"];
  mode: ThemeMode;
}

const palettes: Record<ThemeMode, ColorPalette> = {
  light: lightColors,
  dark: darkColors,
};

/** Resolve a full token set for the given mode. */
export function resolveTheme(mode: ThemeMode = "light"): ThemeTokens {
  const colors = palettes[mode];
  return {
    colors,
    typography: createTypography(colors),
    spacing,
    radius,
    shadows: shadowPalettes[mode],
    mode,
  };
}

/** Default light theme — use `useTheme()` in components for runtime theming. */
export const theme = resolveTheme("light");

export type Theme = ThemeTokens;

export { lightColors } from "./lightColors";
export { darkColors } from "./darkColors";
export { colors } from "./colors";
export { typography, createTypography } from "./typography";
export { spacing } from "./spacing";
export { radius } from "./radius";
export { shadows, shadowPalettes } from "./shadows";
export { tabBarMetrics, floatingFooterMetrics } from "./layout";
export { heroLayout } from "./heroLayout";
export { coachLayout } from "./coachLayout";
export { motion } from "./motion";
export { getElevation, shadowFor } from "./elevation";
export type { ColorPalette, ThemeMode } from "./colorTokens";
export type { ElevationLevel } from "./elevation";
export type { ThemePreference } from "./themePreference";
export { THEME_PREFERENCE_OPTIONS } from "./themePreference";
