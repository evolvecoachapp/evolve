import { View, type ViewStyle } from "react-native";
import { floatingFooterMetrics, spacing } from "../theme/theme";
import { useFloatingFooterBottomOffset } from "../theme/useTabLayout";
import { useThemedStyles } from "../theme/useThemedStyles";

type FloatingSurfaceVariant = "bar" | "footer";

interface FloatingSurfaceProps {
  children: React.ReactNode;
  style?: ViewStyle;
  /** Show top hairline separator — default for bar variant only. */
  bordered?: boolean;
  /** `footer` — elevated glass panel for bottom CTAs and input bars. */
  variant?: FloatingSurfaceVariant;
}

/**
 * Fixed bottom bar / floating panel — glass-like elevated surface.
 * Use `variant="footer"` for workout CTA, coach input, and future floating actions.
 */
export function FloatingSurface({
  children,
  style,
  bordered,
  variant = "bar",
}: FloatingSurfaceProps) {
  const styles = useThemedStyles(({ colors, shadows }) => ({
    barSurface: {
      backgroundColor: colors.glass,
      paddingHorizontal: spacing.screenPadding,
      paddingTop: spacing.md,
      ...shadows.floating,
    },
    footerSurface: {
      backgroundColor: colors.glass,
      borderWidth: 1,
      borderColor: colors.borderStrong,
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.lg,
      paddingBottom: spacing.md,
      gap: spacing.md,
      ...shadows.floating,
    },
    bordered: {
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
  }));

  const isFooter = variant === "footer";

  return (
    <View
      style={[
        isFooter ? styles.footerSurface : styles.barSurface,
        isFooter && { borderRadius: floatingFooterMetrics.radius },
        !isFooter && bordered !== false && styles.bordered,
        style,
      ]}
    >
      {children}
    </View>
  );
}

/** Anchor wrapper for absolute-positioned floating footers above the tab bar. */
export function FloatingFooterAnchor({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: ViewStyle;
}) {
  const bottom = useFloatingFooterBottomOffset();
  const styles = useThemedStyles(() => ({
    anchor: {
      position: "absolute",
      left: 0,
      right: 0,
      paddingHorizontal: floatingFooterMetrics.horizontalInset,
      pointerEvents: "box-none",
    },
  }));

  return (
    <View style={[styles.anchor, { bottom }, style]} pointerEvents="box-none">
      {children}
    </View>
  );
}

export { floatingFooterMetrics };
