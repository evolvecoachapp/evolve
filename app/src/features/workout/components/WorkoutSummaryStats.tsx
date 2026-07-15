import { StyleSheet, Text, View } from "react-native";
import { AppCard } from "../../../components/AppCard";
import { spacing } from "../../../theme/theme";
import { useThemedStyles } from "../../../theme/useThemedStyles";
import type { WorkoutSummary } from "../models/WorkoutSummary";
import { formatDurationMinutes } from "../utils/presentationFormatters";

interface WorkoutSummaryStatsProps {
  summary: WorkoutSummary;
}

interface StatItemProps {
  label: string;
  value: string;
}

function StatItem({ label, value }: StatItemProps) {
  const styles = useThemedStyles(({ colors, typography }) =>
    StyleSheet.create({
      item: {
        flex: 1,
        minWidth: "45%",
        gap: spacing.xs,
      },
      label: {
        ...typography.caption,
        color: colors.inkSecondary,
        fontWeight: "600",
      },
      value: {
        ...typography.title2,
      },
    }),
  );

  return (
    <View style={styles.item}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

function formatVolumeKg(volume: number): string {
  if (volume >= 1000) {
    return `${(volume / 1000).toFixed(1).replace(/\.0$/, "")}k kg`;
  }
  return `${Math.round(volume)} kg`;
}

export function WorkoutSummaryStats({ summary }: WorkoutSummaryStatsProps) {
  const styles = useThemedStyles(({ typography }) =>
    StyleSheet.create({
      card: {
        gap: spacing.lg,
      },
      title: {
        ...typography.title1,
      },
      grid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: spacing.lg,
      },
    }),
  );

  return (
    <AppCard variant="elevated" style={styles.card}>
      <Text style={styles.title}>{summary.title}</Text>
      <View style={styles.grid}>
        <StatItem label="Duration" value={formatDurationMinutes(summary.durationMinutes)} />
        <StatItem label="Total volume" value={formatVolumeKg(summary.totalVolumeKg)} />
        <StatItem
          label="Sets completed"
          value={`${summary.completedSets} / ${summary.totalSets}`}
        />
        <StatItem
          label="Exercises completed"
          value={`${summary.completedExercises} / ${summary.totalExercises}`}
        />
      </View>
    </AppCard>
  );
}
