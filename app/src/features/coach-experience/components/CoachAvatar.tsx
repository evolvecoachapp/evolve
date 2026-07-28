import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, View } from "react-native";
import { useTheme } from "../../../theme/ThemeContext";
import { coachLayout, spacing } from "../../../theme/theme";
import { useThemedStyles } from "../../../theme/useThemedStyles";

type CoachAvatarSize = "sm" | "md" | "lg";

interface CoachAvatarProps {
  readonly size?: CoachAvatarSize;
  readonly glow?: boolean;
}

const SIZE_MAP: Record<CoachAvatarSize, number> = {
  sm: coachLayout.assistantAvatarSize,
  md: spacing.avatar.md,
  lg: spacing.avatar.lg,
};

const ICON_MAP: Record<CoachAvatarSize, number> = {
  sm: spacing.icon.xs,
  md: spacing.icon.sm,
  lg: spacing.icon.md,
};

/** Gradient coach presence avatar — presentation only. */
export function CoachAvatar({ size = "sm", glow = false }: CoachAvatarProps) {
  const { colors } = useTheme();
  const dimension = SIZE_MAP[size];
  const iconSize = ICON_MAP[size];
  const inner = dimension - spacing.xs;

  const styles = useThemedStyles(() =>
    StyleSheet.create({
      wrap: {
        width: dimension,
        height: dimension,
        alignItems: "center",
        justifyContent: "center",
      },
      glow: {
        ...StyleSheet.absoluteFillObject,
        borderRadius: dimension / 2,
        backgroundColor: colors.glowPulse,
      },
      ring: {
        width: dimension,
        height: dimension,
        borderRadius: dimension / 2,
        alignItems: "center",
        justifyContent: "center",
        padding: 2,
      },
      inner: {
        width: inner,
        height: inner,
        borderRadius: inner / 2,
        backgroundColor: colors.ink,
        alignItems: "center",
        justifyContent: "center",
      },
    }),
  );

  return (
    <View
      style={styles.wrap}
      accessibilityRole="image"
      accessibilityLabel="Coach avatar"
    >
      {glow ? <View style={styles.glow} pointerEvents="none" /> : null}
      <LinearGradient
        colors={[colors.pulse, colors.ink]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.ring}
      >
        <View style={styles.inner}>
          <Ionicons name="sparkles" size={iconSize} color={colors.textOnInk} />
        </View>
      </LinearGradient>
    </View>
  );
}
