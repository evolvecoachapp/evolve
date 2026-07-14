import { View, type ViewStyle } from "react-native";
import { AnimatedPressable } from "../animation/AnimatedPressable";
import { radius, spacing } from "../theme/theme";
import { useThemedStyles } from "../theme/useThemedStyles";

type AppCardVariant = "default" | "surface" | "elevated" | "floating" | "inset" | "accent" | "glass";

interface AppCardProps {
  children: React.ReactNode;
  onPress?: () => void;
  /** @deprecated Use `surface` — kept for backward compatibility. */
  variant?: AppCardVariant;
  style?: ViewStyle;
  padding?: "default" | "none" | "compact";
  /** Subtle pulse glow behind card — for featured content. */
  glow?: boolean;
}

function resolveVariant(variant: AppCardVariant) {
  if (variant === "default") {
    return "surface";
  }
  return variant;
}

export function AppCard({
  children,
  onPress,
  variant = "surface",
  style,
  padding = "default",
  glow = false,
}: AppCardProps) {
  const styles = useThemedStyles(({ colors, shadows }) => ({
    base: {
      borderRadius: radius.xl,
      padding: spacing.cardPadding,
      gap: spacing.cardGap,
    },
    paddingNone: {
      padding: 0,
    },
    paddingCompact: {
      padding: spacing.lg,
    },
    surface: {
      backgroundColor: colors.surfaceElevated,
      borderWidth: 1,
      borderColor: colors.border,
      ...shadows.card,
    },
    elevated: {
      backgroundColor: colors.surfaceElevated,
      borderWidth: 1,
      borderColor: colors.border,
      ...shadows.elevated,
    },
    floating: {
      backgroundColor: colors.surfaceElevated,
      borderWidth: 1,
      borderColor: colors.borderStrong,
      ...shadows.floating,
    },
    inset: {
      backgroundColor: colors.canvas,
      borderWidth: 1,
      borderColor: colors.borderStrong,
    },
    accent: {
      backgroundColor: colors.surfaceElevated,
      borderWidth: 1,
      borderColor: colors.border,
      borderLeftWidth: 3,
      borderLeftColor: colors.pulse,
      ...shadows.elevated,
    },
    glass: {
      backgroundColor: colors.glass,
      borderWidth: 1,
      borderColor: colors.borderGlass,
      ...shadows.elevated,
    },
    glowWrapper: {
      position: "relative",
    },
    glow: {
      ...shadows.glow,
    },
    pressed: {
      backgroundColor: colors.overlay,
    },
  }));

  const resolved = resolveVariant(variant);

  const cardStyle = [
    styles.base,
    resolved === "surface" && styles.surface,
    resolved === "elevated" && styles.elevated,
    resolved === "floating" && styles.floating,
    resolved === "inset" && styles.inset,
    resolved === "accent" && styles.accent,
    resolved === "glass" && styles.glass,
    padding === "none" && styles.paddingNone,
    padding === "compact" && styles.paddingCompact,
    glow && styles.glow,
    style,
  ];

  const content = onPress ? (
    <AnimatedPressable
      accessibilityRole="button"
      onPress={onPress}
      variant="card"
      style={cardStyle}
      pressedStyle={styles.pressed}
    >
      {children}
    </AnimatedPressable>
  ) : (
    <View style={cardStyle}>{children}</View>
  );

  if (glow) {
    return <View style={styles.glowWrapper}>{content}</View>;
  }

  return content;
}
