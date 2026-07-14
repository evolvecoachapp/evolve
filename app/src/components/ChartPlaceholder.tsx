import { Ionicons } from "@expo/vector-icons";
import { Text, View, type ViewStyle } from "react-native";
import { useTheme } from "../theme/ThemeContext";
import { radius, spacing } from "../theme/theme";
import { useThemedStyles } from "../theme/useThemedStyles";

interface ChartPlaceholderProps {
  icon: keyof typeof Ionicons.glyphMap;
  label?: string;
  height?: number;
  style?: ViewStyle;
}

/**
 * Premium placeholder for charts — layered inset surface with subtle depth.
 */
export function ChartPlaceholder({
  icon,
  label = "Chart coming soon",
  height = spacing.chart.md,
  style,
}: ChartPlaceholderProps) {
  const { colors } = useTheme();
  const styles = useThemedStyles(({ colors, typography }) => ({
    outer: {
      backgroundColor: colors.overlay,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: "hidden",
    },
    inner: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      gap: spacing.sm,
      padding: spacing.lg,
    },
    iconRing: {
      width: spacing["3xl"],
      height: spacing["3xl"],
      borderRadius: radius.full,
      backgroundColor: colors.surfaceElevated,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: "center",
      justifyContent: "center",
    },
    label: {
      ...typography.caption,
      color: colors.inkMuted,
    },
  }));

  return (
    <View style={[styles.outer, { minHeight: height }, style]}>
      <View style={styles.inner}>
        <View style={styles.iconRing}>
          <Ionicons name={icon} size={spacing.icon.xl} color={colors.inkMuted} />
        </View>
        <Text style={styles.label}>{label}</Text>
      </View>
    </View>
  );
}
