import { radius } from "./radius";
import { spacing } from "./spacing";

/** Layout constants for premium hero zones — derived from spacing tokens. */
export const heroLayout = {
  minHeight: spacing["3xl"] * 2,
  paddingTop: spacing.lg,
  paddingBottom: spacing["2xl"],
  contentGap: spacing.md,
  headlineGap: spacing.xs,
  chipRowGap: spacing.sm,
  chipRowMarginTop: spacing.xl,
  ambientInset: spacing.xl,
  shapeSizeSm: spacing["3xl"],
  shapeSizeMd: spacing["3xl"] + spacing.lg,
  shapeSizeLg: spacing["3xl"] * 2,
  glowSizePrimary: spacing["3xl"] * 4,
  glowSizeSecondary: spacing["3xl"] * 3,
  heroRadius: radius.xl,
  /** Welcome screen ambient glow diameter. */
  welcomeGlowSize: spacing["3xl"] * 5,
  /** Welcome screen glow offset from hero block. */
  welcomeGlowOffset: {
    top: -spacing["3xl"] - spacing["2xl"],
    right: -spacing["3xl"] - spacing.lg,
  },
  /** Hero gradient variant glow size and offset. */
  gradientGlowSize: spacing["3xl"] * 3 + spacing.lg,
  gradientGlowOffset: {
    top: -spacing["2xl"],
    right: -spacing.xl,
  },
  /** Headline max-width ratios per hero context. */
  headlineMaxWidth: {
    dashboard: "88%",
    coach: "58%",
    nutrition: "92%",
  },
} as const;
