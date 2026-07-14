import type { TextStyle } from "react-native";
import type { ColorPalette } from "./colorTokens";
import { lightColors } from "./lightColors";

const tabularNums: Pick<TextStyle, "fontVariant"> = {
  fontVariant: ["tabular-nums"],
};

type TypographyScale = {
  hero: TextStyle;
  titleWelcome: TextStyle;
  display: TextStyle;
  title1: TextStyle;
  title2: TextStyle;
  title3: TextStyle;
  body: TextStyle;
  bodyRelaxed: TextStyle;
  bodyLead: TextStyle;
  bodyMedium: TextStyle;
  callout: TextStyle;
  caption: TextStyle;
  micro: TextStyle;
  eyebrow: TextStyle;
  metric: TextStyle;
  metricCompact: TextStyle;
  metricLarge: TextStyle;
  orderBadge: TextStyle;
  button: TextStyle;
  buttonSmall: TextStyle;
  h1: TextStyle;
  h2: TextStyle;
  h3: TextStyle;
  bodySmall: TextStyle;
};

/** Build typography styles bound to the active palette. */
export function createTypography(colors: ColorPalette): TypographyScale {
  return {
    hero: {
      fontSize: 48,
      fontWeight: "700",
      lineHeight: 52,
      letterSpacing: -1.5,
      color: colors.ink,
      ...tabularNums,
    },
    titleWelcome: {
      fontSize: 52,
      fontWeight: "700",
      lineHeight: 56,
      letterSpacing: -1.5,
      color: colors.ink,
      ...tabularNums,
    },
    display: {
      fontSize: 36,
      fontWeight: "700",
      lineHeight: 40,
      letterSpacing: -1,
      color: colors.ink,
    },
    title1: {
      fontSize: 28,
      fontWeight: "700",
      lineHeight: 34,
      letterSpacing: -0.5,
      color: colors.ink,
    },
    title2: {
      fontSize: 22,
      fontWeight: "600",
      lineHeight: 28,
      letterSpacing: -0.3,
      color: colors.ink,
    },
    title3: {
      fontSize: 18,
      fontWeight: "600",
      lineHeight: 24,
      color: colors.ink,
    },
    body: {
      fontSize: 16,
      fontWeight: "400",
      lineHeight: 24,
      color: colors.ink,
    },
    bodyRelaxed: {
      fontSize: 16,
      fontWeight: "400",
      lineHeight: 22,
      color: colors.ink,
    },
    bodyLead: {
      fontSize: 17,
      fontWeight: "400",
      lineHeight: 26,
      color: colors.inkSecondary,
    },
    bodyMedium: {
      fontSize: 16,
      fontWeight: "500",
      lineHeight: 24,
      color: colors.ink,
    },
    callout: {
      fontSize: 14,
      fontWeight: "500",
      lineHeight: 20,
      color: colors.inkSecondary,
    },
    caption: {
      fontSize: 12,
      fontWeight: "500",
      lineHeight: 16,
      letterSpacing: 0.3,
      color: colors.inkSecondary,
    },
    micro: {
      fontSize: 10,
      fontWeight: "600",
      lineHeight: 12,
      letterSpacing: 0.8,
      color: colors.inkMuted,
    },
    eyebrow: {
      fontSize: 12,
      fontWeight: "600",
      lineHeight: 16,
      letterSpacing: 0.8,
      textTransform: "uppercase",
      color: colors.inkSecondary,
    },
    metric: {
      fontSize: 40,
      fontWeight: "700",
      lineHeight: 44,
      letterSpacing: -1.2,
      color: colors.ink,
      ...tabularNums,
    },
    metricCompact: {
      fontSize: 32,
      fontWeight: "700",
      lineHeight: 36,
      letterSpacing: -0.8,
      color: colors.ink,
      ...tabularNums,
    },
    metricLarge: {
      fontSize: 56,
      fontWeight: "700",
      lineHeight: 56,
      letterSpacing: -2,
      color: colors.ink,
      ...tabularNums,
    },
    orderBadge: {
      fontSize: 24,
      fontWeight: "600",
      lineHeight: 28,
      letterSpacing: -0.3,
      color: colors.inkSecondary,
      ...tabularNums,
    },
    button: {
      fontSize: 16,
      fontWeight: "600",
      lineHeight: 20,
      letterSpacing: 0.2,
    },
    buttonSmall: {
      fontSize: 14,
      fontWeight: "600",
      lineHeight: 18,
      letterSpacing: 0.2,
    },
    h1: {
      fontSize: 28,
      fontWeight: "700",
      lineHeight: 34,
      letterSpacing: -0.5,
      color: colors.ink,
    },
    h2: {
      fontSize: 22,
      fontWeight: "600",
      lineHeight: 28,
      letterSpacing: -0.3,
      color: colors.ink,
    },
    h3: {
      fontSize: 18,
      fontWeight: "600",
      lineHeight: 24,
      color: colors.ink,
    },
    bodySmall: {
      fontSize: 14,
      fontWeight: "500",
      lineHeight: 20,
      color: colors.inkSecondary,
    },
  };
}

/** Static light typography — prefer `useTheme().typography` in components. */
export const typography = createTypography(lightColors);

export type { TypographyScale };
