import { ActivityIndicator, Platform, Text, type ViewStyle } from "react-native";
import { AnimatedPressable } from "../animation/AnimatedPressable";
import type { HapticFeedback } from "../haptics/triggerHaptic";
import { useTheme } from "../theme/ThemeContext";
import { radius, spacing } from "../theme/theme";
import { useThemedStyles } from "../theme/useThemedStyles";

type ButtonVariant = "primary" | "secondary" | "ghost" | "destructive";
type ButtonSize = "sm" | "md" | "lg";
type ButtonInteraction = "default" | "floating";

interface AppButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  /** Spring press for floating CTAs. */
  interaction?: ButtonInteraction;
  haptic?: HapticFeedback;
}

const SIZE_STYLES: Record<ButtonSize, ViewStyle> = {
  sm: {
    minHeight: spacing["3xl"] + spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
  },
  md: {
    minHeight: spacing["3xl"],
    paddingHorizontal: spacing.cardPadding,
    borderRadius: radius.button,
  },
  lg: {
    minHeight: spacing["3xl"] + spacing.sm,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.lg,
  },
};

export function AppButton({
  label,
  onPress,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  style,
  interaction = "default",
  haptic,
}: AppButtonProps) {
  const { colors } = useTheme();
  const styles = useThemedStyles(({ colors, typography }) => ({
    base: {
      alignItems: "center",
      justifyContent: "center",
    },
    primary: {
      backgroundColor: colors.ink,
      ...Platform.select({
        ios: {
          shadowColor: colors.ink,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.2,
          shadowRadius: 12,
        },
        android: { elevation: 4 },
        default: {},
      }),
    },
    secondary: {
      backgroundColor: "transparent",
      borderWidth: 1.5,
      borderColor: colors.borderStrong,
    },
    ghost: {
      backgroundColor: "transparent",
    },
    destructive: {
      backgroundColor: colors.criticalMuted,
    },
    disabled: {
      opacity: spacing.interaction.disabledOpacity,
    },
    pressed: {
      opacity: spacing.interaction.pressedOpacity,
    },
    label: {
      ...typography.button,
    },
    labelSmall: {
      ...typography.buttonSmall,
    },
    primaryLabel: {
      color: colors.canvas,
    },
    secondaryLabel: {
      color: colors.ink,
    },
    ghostLabel: {
      color: colors.pulse,
    },
    destructiveLabel: {
      color: colors.critical,
    },
  }));

  const isDisabled = disabled || loading;

  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
      onPress={onPress}
      disabled={isDisabled}
      variant={interaction === "floating" ? "floating" : "default"}
      haptic={haptic}
      style={[
        styles.base,
        SIZE_STYLES[size],
        variant === "primary" && styles.primary,
        variant === "secondary" && styles.secondary,
        variant === "ghost" && styles.ghost,
        variant === "destructive" && styles.destructive,
        isDisabled && styles.disabled,
        style,
      ]}
      pressedStyle={styles.pressed}
    >
      {loading ? (
        <ActivityIndicator
          color={
            variant === "primary"
              ? colors.canvas
              : variant === "destructive"
                ? colors.critical
                : colors.ink
          }
        />
      ) : (
        <Text
          style={[
            size === "sm" ? styles.labelSmall : styles.label,
            variant === "primary" && styles.primaryLabel,
            variant === "secondary" && styles.secondaryLabel,
            variant === "ghost" && styles.ghostLabel,
            variant === "destructive" && styles.destructiveLabel,
          ]}
        >
          {label}
        </Text>
      )}
    </AnimatedPressable>
  );
}
