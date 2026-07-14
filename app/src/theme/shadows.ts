import { Platform, type ViewStyle } from "react-native";
import type { ThemeMode } from "./colorTokens";
import { lightColors } from "./lightColors";

function iosShadow(
  shadowColor: string,
  offsetY: number,
  blur: number,
  opacity: number,
): Pick<ViewStyle, "shadowColor" | "shadowOffset" | "shadowOpacity" | "shadowRadius"> {
  return {
    shadowColor,
    shadowOffset: { width: 0, height: offsetY },
    shadowOpacity: opacity,
    shadowRadius: blur,
  };
}

function createLightShadows(ink: string, pulse: string) {
  return {
    card: Platform.select<ViewStyle>({
      ios: iosShadow(ink, 2, 16, 0.06),
      android: { elevation: 3 },
      default: {},
    })!,
    elevated: Platform.select<ViewStyle>({
      ios: iosShadow(ink, 8, 32, 0.1),
      android: { elevation: 8 },
      default: {},
    })!,
    floating: Platform.select<ViewStyle>({
      ios: iosShadow(ink, 12, 40, 0.12),
      android: { elevation: 12 },
      default: {},
    })!,
    glow: Platform.select<ViewStyle>({
      ios: {
        shadowColor: pulse,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 24,
      },
      android: { elevation: 6 },
      default: {},
    })!,
  } as const;
}

const lightShadows = createLightShadows(lightColors.ink, lightColors.pulse);

/** Dark mode relies on surface luminance — no drop shadows. */
const darkShadows = {
  card: Platform.select<ViewStyle>({
    android: { elevation: 0 },
    default: {},
  })!,
  elevated: Platform.select<ViewStyle>({
    android: { elevation: 0 },
    default: {},
  })!,
  floating: Platform.select<ViewStyle>({
    android: { elevation: 0 },
    default: {},
  })!,
  glow: Platform.select<ViewStyle>({
    android: { elevation: 0 },
    default: {},
  })!,
} as const;

export type ShadowToken = keyof typeof lightShadows;

export const shadows = lightShadows;

export const shadowPalettes: Record<ThemeMode, typeof lightShadows> = {
  light: lightShadows,
  dark: darkShadows,
};
