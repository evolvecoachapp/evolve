import { Text, View } from "react-native";
import { AppCard } from "../../../components/AppCard";
import { spacing } from "../../../theme/theme";
import { useThemedStyles } from "../../../theme/useThemedStyles";
import type { WorkoutStatistics } from "../models/experience/WorkoutStatistics";

interface WorkoutStatisticsCardProps {
  readonly statistics: WorkoutStatistics;
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs}s`;
}

/** Statistics summary card — presentation only. */
export function WorkoutStatisticsCard({
  statistics,
}: WorkoutStatisticsCardProps) {
  const styles = useThemedStyles(({ colors, typography }) => ({
    body: {
      gap: spacing.md,
    },
    title: {
      ...typography.caption,
      color: colors.inkMuted,
      fontWeight: "700" as const,
      textTransform: "uppercase" as const,
      letterSpacing: 0.6,
    },
    grid: {
      flexDirection: "row" as const,
      flexWrap: "wrap" as const,
      gap: spacing.md,
    },
    cell: {
      width: "47%" as const,
      gap: spacing.xs,
    },
    value: {
      ...typography.title3,
      color: colors.ink,
    },
    label: {
      ...typography.caption,
      color: colors.inkMuted,
    },
  }));

  return (
    <AppCard variant="elevated">
      <View style={styles.body}>
        <Text style={styles.title}>Session stats</Text>
        <View style={styles.grid}>
          <View style={styles.cell}>
            <Text style={styles.value}>{statistics.totalVolume}</Text>
            <Text style={styles.label}>Volume (kg)</Text>
          </View>
          <View style={styles.cell}>
            <Text style={styles.value}>
              {statistics.averageRpe ?? "—"}
            </Text>
            <Text style={styles.label}>Avg RPE</Text>
          </View>
          <View style={styles.cell}>
            <Text style={styles.value}>
              {formatDuration(statistics.durationSeconds)}
            </Text>
            <Text style={styles.label}>Duration</Text>
          </View>
          <View style={styles.cell}>
            <Text style={styles.value}>
              {statistics.completedSets}/{statistics.completedSets + statistics.remainingSets}
            </Text>
            <Text style={styles.label}>Sets</Text>
          </View>
        </View>
      </View>
    </AppCard>
  );
}
