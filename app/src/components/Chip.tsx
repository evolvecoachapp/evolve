import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View, type ViewStyle } from "react-native";
import { useTheme } from "../theme/ThemeContext";
import { radius, spacing } from "../theme/theme";
import { useThemedStyles } from "../theme/useThemedStyles";

type ChipVariant = "neutral" | "accent" | "warm" | "outline" | "selected";
type ChipSize = "sm" | "md" | "lg";

interface ChipProps {
  label: string;
  variant?: ChipVariant;
  size?: ChipSize;
  icon?: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
  style?: ViewStyle;
  /** Overrides the accessibility label — defaults to `label` when omitted. */
  accessibilityLabel?: string;
  /** Only meaningful with `onPress` — keeps the chip visibly pressable but inert. */
  disabled?: boolean;
}

const SIZE_STYLES: Record<ChipSize, ViewStyle> = {
  sm: {
    paddingHorizontal: spacing.sm + spacing.xs,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
  },
  md: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm - spacing.xs,
    borderRadius: radius.md,
  },
  lg: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
  },
};

export function Chip({
  label,
  variant = "neutral",
  size = "md",
  icon,
  onPress,
  style,
  accessibilityLabel,
  disabled = false,
}: ChipProps) {
  const { colors, typography } = useTheme();
  const styles = useThemedStyles(({ colors }) => ({
    base: {
      flexDirection: "row",
      alignItems: "center",
      alignSelf: "flex-start",
      gap: spacing.sm - spacing.xs,
      borderWidth: 1,
      borderColor: "transparent",
    },
    neutral: {
      backgroundColor: colors.overlayStrong,
      borderColor: colors.border,
    },
    accent: {
      backgroundColor: colors.pulseMuted,
      borderColor: colors.borderPulse,
    },
    warm: {
      backgroundColor: colors.warmMuted,
      borderColor: colors.borderWarm,
    },
    outline: {
      backgroundColor: "transparent",
      borderColor: colors.borderStrong,
    },
    selected: {
      backgroundColor: colors.ink,
      borderColor: colors.ink,
    },
    pressed: {
      opacity: spacing.interaction.chipPressedOpacity,
      transform: [{ scale: spacing.interaction.pressedScaleSubtle }],
    },
    neutralText: {
      color: colors.inkSecondary,
      fontWeight: "500",
    },
    accentText: {
      color: colors.pulse,
      fontWeight: "600",
    },
    warmText: {
      color: colors.warm,
      fontWeight: "600",
    },
    outlineText: {
      color: colors.inkSecondary,
    },
    selectedText: {
      color: colors.canvas,
      fontWeight: "600",
    },
  }));

  const textStyles = {
    sm: typography.caption,
    md: typography.callout,
    lg: typography.bodyMedium,
  };

  const iconColors: Record<ChipVariant, string> = {
    neutral: colors.inkSecondary,
    accent: colors.pulse,
    warm: colors.warm,
    outline: colors.inkSecondary,
    selected: colors.canvas,
  };

  const content = (
    <>
      {icon ? (
        <Ionicons
          name={icon}
          size={size === "sm" ? spacing.icon.xs : spacing.icon.sm}
          color={iconColors[variant]}
        />
      ) : null}
      <Text
        style={[
          textStyles[size],
          variant === "neutral" && styles.neutralText,
          variant === "accent" && styles.accentText,
          variant === "warm" && styles.warmText,
          variant === "outline" && styles.outlineText,
          variant === "selected" && styles.selectedText,
        ]}
        numberOfLines={2}
      >
        {label}
      </Text>
    </>
  );

  const chipStyle = [
    styles.base,
    SIZE_STYLES[size],
    variant === "neutral" && styles.neutral,
    variant === "accent" && styles.accent,
    variant === "warm" && styles.warm,
    variant === "outline" && styles.outline,
    variant === "selected" && styles.selected,
    style,
  ];

  if (onPress) {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel ?? label}
        accessibilityState={{ selected: variant === "selected", disabled }}
        disabled={disabled}
        onPress={onPress}
        style={({ pressed }) => [
          ...chipStyle,
          disabled && { opacity: spacing.interaction.disabledOpacity },
          pressed && styles.pressed,
        ]}
      >
        {content}
      </Pressable>
    );
  }

  return <View style={chipStyle}>{content}</View>;
}
