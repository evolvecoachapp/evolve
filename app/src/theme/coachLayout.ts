import { heroLayout } from "./heroLayout";
import { radius } from "./radius";
import { spacing } from "./spacing";

/** Layout constants for Coach AI surfaces — derived from spacing and hero tokens. */
export const coachLayout = {
  heroMinHeight: heroLayout.minHeight + spacing.xl,
  presenceOrbSize: heroLayout.glowSizePrimary,
  presenceOrbInnerSize: spacing["3xl"] + spacing.lg,
  messageMaxWidth: "84%",
  messageGap: spacing.md,
  messageSectionGap: spacing.lg,
  assistantAvatarSize: spacing["2xl"],
  bubblePadding: spacing.lg,
  bubbleTailRadius: spacing.sm,
  userBubbleRadius: radius.xl,
  assistantBubbleRadius: radius.xl,
  inputMinHeight: spacing["3xl"],
  inputBarRadius: radius.xl,
  inputBarInset: spacing.md,
  inputFieldRadius: radius.full,
  sendButtonSize: spacing["3xl"],
  inputBarGap: spacing.sm,
} as const;
