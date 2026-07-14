import type { ViewStyle } from "react-native";
import type { ColorPalette } from "./colorTokens";
import type { ShadowToken } from "./shadows";
import { shadowPalettes } from "./shadows";

export type ElevationLevel = 0 | 1 | 2 | 3;

export interface ElevationStyle {
  level: ElevationLevel;
  backgroundColor: string;
  borderColor?: string;
  borderWidth?: number;
  shadow?: ViewStyle;
}

/**
 * Functional depth system — Level 0 canvas through Level 3 overlay.
 * Z-axis encodes action priority, not decoration.
 */
export function getElevation(
  level: ElevationLevel,
  colors: ColorPalette,
  mode: "light" | "dark" = "light",
): ElevationStyle {
  const shadowSet = shadowPalettes[mode];

  switch (level) {
    case 0:
      return {
        level,
        backgroundColor: colors.canvas,
      };
    case 1:
      return {
        level,
        backgroundColor: colors.surface,
        borderColor: colors.border,
        borderWidth: 1,
        shadow: shadowSet.card,
      };
    case 2:
      return {
        level,
        backgroundColor: colors.surfaceElevated,
        borderColor: colors.border,
        borderWidth: 1,
        shadow: shadowSet.elevated,
      };
    case 3:
      return {
        level,
        backgroundColor: colors.surfaceElevated,
        borderColor: colors.borderStrong,
        borderWidth: 1,
        shadow: shadowSet.floating,
      };
  }
}

export function shadowFor(token: ShadowToken, mode: "light" | "dark" = "light"): ViewStyle {
  return shadowPalettes[mode][token];
}
