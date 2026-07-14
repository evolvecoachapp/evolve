import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing, typography } from "../theme/theme";

interface StatCardProps {
  label: string;
  value: string | number;
  unit?: string;
  trend?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  progress?: number;
}

export function StatCard({ label, value, unit, trend, icon, progress }: StatCardProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {icon ? <Ionicons name={icon} size={18} color={colors.textSecondary} /> : null}
        <Text style={styles.label}>{label}</Text>
      </View>
      <View style={styles.valueRow}>
        <Text style={styles.value}>{value}</Text>
        {unit ? <Text style={styles.unit}>{unit}</Text> : null}
      </View>
      {trend ? <Text style={styles.trend}>{trend}</Text> : null}
      {progress !== undefined ? (
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${Math.min(progress, 100)}%` }]} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    minWidth: 0,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  label: {
    ...typography.caption,
  },
  valueRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: spacing.xs,
  },
  value: {
    ...typography.h2,
    fontSize: 20,
  },
  unit: {
    ...typography.caption,
    color: colors.textMuted,
  },
  trend: {
    ...typography.caption,
    color: colors.accent,
    marginTop: spacing.xs,
  },
  progressTrack: {
    height: 4,
    backgroundColor: colors.border,
    borderRadius: radius.full,
    marginTop: spacing.sm,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: colors.accent,
    borderRadius: radius.full,
  },
});
