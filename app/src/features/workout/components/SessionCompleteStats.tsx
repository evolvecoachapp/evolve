import { StyleSheet, Text, View } from "react-native";
import { AppCard } from "../../../components/AppCard";
import { spacing } from "../../../theme/theme";
import { useThemedStyles } from "../../../theme/useThemedStyles";
import type { WorkoutSessionSummary } from "../types/workoutSessionSummary";
import { formatSessionDuration, formatSessionVolumeKg } from "../utils/sessionSummaryFormatters";

interface SessionCompleteStatsProps {
  summary: WorkoutSessionSummary;
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

/** Presentation card for a local `WorkoutSessionSummary`. */
export function SessionCompleteStats({ summary }: SessionCompleteStatsProps) {
  const styles = useThemedStyles(({ colors, typography }) =>
    StyleSheet.create({
      card: {
        gap: spacing.lg,
      },
      title: {
        ...typography.title1,
      },
      timestamp: {
        ...typography.caption,
        color: colors.inkMuted,
      },
      grid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: spacing.lg,
      },
    }),
  );

  const averageReps =
    summary.averageCompletedReps === null
      ? "—"
      : String(summary.averageCompletedReps);

  return (
    <AppCard variant="elevated" style={styles.card}>
      <Text style={styles.title}>{summary.title}</Text>
      <Text style={styles.timestamp}>
        Finished {formatCompletedAt(summary.completedAt)}
      </Text>
      <View style={styles.grid}>
        <StatItem label="Duration" value={formatSessionDuration(summary.durationSeconds)} />
        <StatItem label="Est. volume" value={formatSessionVolumeKg(summary.estimatedVolumeKg)} />
        <StatItem
          label="Sets completed"
          value={`${summary.completedSets} / ${summary.totalSets}`}
        />
        <StatItem label="Sets skipped" value={String(summary.skippedSets)} />
        <StatItem
          label="Exercises completed"
          value={`${summary.completedExercises} / ${summary.totalExercises}`}
        />
        <StatItem label="Completion" value={`${summary.completionPercent}%`} />
        <StatItem label="Avg. working reps" value={averageReps} />
      </View>
    </AppCard>
  );
}

function formatCompletedAt(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return iso;
  }
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
