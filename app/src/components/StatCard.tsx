import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";
import { ProgressBar } from "./ProgressBar";
import { useTheme } from "../theme/ThemeContext";
import { radius, spacing } from "../theme/theme";
import { useThemedStyles } from "../theme/useThemedStyles";

interface StatCardProps {
  label: string;
  value: string | number;
  unit?: string;
  trend?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  progress?: number;
  /** Renders a compact metric without card chrome — for embedding in hero rows. */
  embedded?: boolean;
}

export function StatCard({
  label,
  value,
  unit,
  trend,
  icon,
  progress,
  embedded = false,
}: StatCardProps) {
  const { colors } = useTheme();
  const styles = useThemedStyles(({ colors, typography, shadows }) => ({
    container: {
      flex: 1,
      backgroundColor: colors.surfaceElevated,
      borderRadius: radius.lg,
      padding: spacing.lg,
      borderWidth: 1,
      borderColor: colors.border,
      minWidth: 0,
      ...shadows.card,
    },
    embedded: {
      backgroundColor: colors.canvas,
      borderColor: colors.borderStrong,
      shadowOpacity: 0,
      elevation: 0,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
      marginBottom: spacing.sm,
    },
    iconRing: {
      width: spacing.avatar.sm,
      height: spacing.avatar.sm,
      borderRadius: radius.full,
      backgroundColor: colors.pulseMuted,
      alignItems: "center",
      justifyContent: "center",
    },
    label: {
      ...typography.caption,
      color: colors.inkMuted,
      flex: 1,
    },
    valueRow: {
      flexDirection: "row",
      alignItems: "baseline",
      gap: spacing.xs,
    },
    value: {
      ...typography.metricCompact,
    },
    unit: {
      ...typography.callout,
      color: colors.inkMuted,
    },
    trend: {
      ...typography.caption,
      color: colors.pulse,
      marginTop: spacing.xs,
      fontWeight: "600",
    },
    progress: {
      marginTop: spacing.md,
    },
  }));

  return (
    <View style={[styles.container, embedded && styles.embedded]}>
      <View style={styles.header}>
        {icon ? (
          <View style={styles.iconRing}>
            <Ionicons name={icon} size={spacing.icon.sm} color={colors.pulse} />
          </View>
        ) : null}
        <Text style={styles.label}>{label}</Text>
      </View>
      <View style={styles.valueRow}>
        <Text style={styles.value}>{value}</Text>
        {unit ? <Text style={styles.unit}>{unit}</Text> : null}
      </View>
      {trend ? <Text style={styles.trend}>{trend}</Text> : null}
      {progress !== undefined ? (
        <ProgressBar progress={progress} style={styles.progress} />
      ) : null}
    </View>
  );
}
