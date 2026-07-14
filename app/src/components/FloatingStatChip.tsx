import { Ionicons } from "@expo/vector-icons";
import { Text, View, type ViewStyle } from "react-native";
import Animated from "react-native-reanimated";
import { chipEntering } from "../animation/entering";
import { useReduceMotion } from "../animation/useReduceMotion";
import { useTheme } from "../theme/ThemeContext";
import { radius, spacing } from "../theme/theme";
import { useThemedStyles } from "../theme/useThemedStyles";

type FloatingStatTone = "neutral" | "accent" | "warm";

interface FloatingStatChipProps {
  label: string;
  value: string;
  icon?: keyof typeof Ionicons.glyphMap;
  tone?: FloatingStatTone;
  style?: ViewStyle;
  /** Stagger index for entrance animation — omit to skip enter motion. */
  enterIndex?: number;
}

/**
 * Glass floating metric chip — for hero stat rows and ambient overlays.
 */
export function FloatingStatChip({
  label,
  value,
  icon,
  tone = "neutral",
  style,
  enterIndex,
}: FloatingStatChipProps) {
  const { colors } = useTheme();
  const reduceMotion = useReduceMotion();
  const styles = useThemedStyles(({ colors, typography, shadows }) => ({
    chip: {
      borderRadius: radius.lg,
      borderWidth: 1,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm + spacing.xs,
      minWidth: spacing.floatingChipMinWidth,
      gap: spacing.xs,
      ...shadows.floating,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.xs,
    },
    iconRing: {
      width: spacing.badge.sm,
      height: spacing.badge.sm,
      borderRadius: radius.full,
      alignItems: "center",
      justifyContent: "center",
    },
    label: {
      ...typography.micro,
      textTransform: "uppercase",
      color: colors.inkMuted,
      flexShrink: 1,
    },
    value: {
      ...typography.title3,
      letterSpacing: -0.2,
    },
  }));

  const toneStyles: Record<
    FloatingStatTone,
    { background: string; border: string; iconBg: string; iconColor: string; valueColor: string }
  > = {
    neutral: {
      background: colors.glass,
      border: colors.border,
      iconBg: colors.overlayStrong,
      iconColor: colors.inkSecondary,
      valueColor: colors.ink,
    },
    accent: {
      background: colors.glass,
      border: colors.pulseMuted,
      iconBg: colors.pulseMuted,
      iconColor: colors.pulse,
      valueColor: colors.ink,
    },
    warm: {
      background: colors.glass,
      border: colors.warmMuted,
      iconBg: colors.warmMuted,
      iconColor: colors.warm,
      valueColor: colors.ink,
    },
  };

  const toneStyle = toneStyles[tone];

  const chip = (
    <View
      style={[
        styles.chip,
        {
          backgroundColor: toneStyle.background,
          borderColor: toneStyle.border,
        },
        style,
      ]}
    >
      <View style={styles.header}>
        {icon ? (
          <View style={[styles.iconRing, { backgroundColor: toneStyle.iconBg }]}>
            <Ionicons name={icon} size={spacing.icon.xs} color={toneStyle.iconColor} />
          </View>
        ) : null}
        <Text style={styles.label}>{label}</Text>
      </View>
      <Text style={[styles.value, { color: toneStyle.valueColor }]}>{value}</Text>
    </View>
  );

  if (enterIndex === undefined) {
    return chip;
  }

  return (
    <Animated.View entering={chipEntering(enterIndex, reduceMotion)}>{chip}</Animated.View>
  );
}
