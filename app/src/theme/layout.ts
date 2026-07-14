import { coachLayout } from "./coachLayout";
import { radius } from "./radius";
import { spacing } from "./spacing";

/** Metrics for the floating premium tab bar. */
export const tabBarMetrics = {
  height: 64,
  horizontalInset: spacing.lg,
  bottomMargin: spacing.sm,
  /** Coach tab emphasized icon wrap diameter. */
  coachIconWrap: spacing.avatar.md,
  /** Total vertical space screens should reserve above the home indicator. */
  get reservedSpace() {
    return this.height + this.bottomMargin + spacing.xl;
  },
} as const;

/**
 * Shared metrics for floating bottom bars (workout CTA, coach input, future CTAs).
 * Tab scenes already reserve tab-bar space via sceneStyle — footers only need
 * a small gap above that reserved zone.
 */
export const floatingFooterMetrics = {
  horizontalInset: tabBarMetrics.horizontalInset,
  bottomGap: spacing.md,
  radius: radius.xl,
  /** Approximate workout footer content height (summary + CTA + internal padding). */
  workoutContentHeight:
    spacing.lg + spacing.md + spacing.xl + spacing["3xl"],
  /** Approximate coach input bar content height. */
  coachInputContentHeight:
    coachLayout.inputMinHeight + spacing.md * 3,
  /** Bottom offset within the tab scene — sits just above tab-bar reserved space. */
  anchorBottom: spacing.sm,
  /** Scroll content padding to clear a floating footer. */
  scrollReserve(contentHeight: number) {
    return contentHeight + spacing.xl + this.bottomGap;
  },
} as const;
