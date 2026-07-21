import { StyleSheet, Text, View } from "react-native";
import { AppCard } from "../../../components/AppCard";
import { SectionTitle } from "../../../components/SectionTitle";
import { spacing } from "../../../theme/theme";
import { useThemedStyles } from "../../../theme/useThemedStyles";
import type { WeeklyAnalytics } from "../models/WeeklyAnalytics";
import { formatAnalyticsVolumeKg } from "./formatAnalyticsDisplay";

export interface WeeklySummaryCardProps {
  weekly: WeeklyAnalytics;
  /** Workout count for the current UTC week (from workoutFrequency). */
  currentWeekWorkouts: number;
  /** Workout count for the previous UTC week (from workoutFrequency). */
  previousWeekWorkouts: number;
}

/** Week-over-week summary — workouts and volume only, no charts. */
export function WeeklySummaryCard({
  weekly,
  currentWeekWorkouts,
  previousWeekWorkouts,
}: WeeklySummaryCardProps) {
  const styles = useThemedStyles(({ colors, typography }) =>
    StyleSheet.create({
      section: {
        gap: spacing.sm,
      },
      columns: {
        flexDirection: "row",
        gap: spacing.md,
      },
      column: {
        flex: 1,
        gap: spacing.sm,
        minWidth: 0,
      },
      columnLabel: {
        ...typography.caption,
        color: colors.inkMuted,
        marginBottom: spacing.xs,
      },
      metricRow: {
        gap: spacing.xs,
      },
      metricLabel: {
        ...typography.micro,
        color: colors.inkMuted,
      },
      metricValue: {
        ...typography.title3,
        color: colors.ink,
      },
    }),
  );

  return (
    <View style={styles.section} testID="weekly-summary-card">
      <SectionTitle title="Weekly Summary" />
      <AppCard variant="elevated">
        <View style={styles.columns}>
          <View style={styles.column}>
            <Text style={styles.columnLabel}>Current Week</Text>
            <View style={styles.metricRow}>
              <Text style={styles.metricLabel}>Workouts</Text>
              <Text style={styles.metricValue}>{currentWeekWorkouts}</Text>
            </View>
            <View style={styles.metricRow}>
              <Text style={styles.metricLabel}>Volume</Text>
              <Text style={styles.metricValue}>
                {formatAnalyticsVolumeKg(weekly.currentWeekVolumeKg)}
              </Text>
            </View>
          </View>

          <View style={styles.column}>
            <Text style={styles.columnLabel}>Previous Week</Text>
            <View style={styles.metricRow}>
              <Text style={styles.metricLabel}>Workouts</Text>
              <Text style={styles.metricValue}>{previousWeekWorkouts}</Text>
            </View>
            <View style={styles.metricRow}>
              <Text style={styles.metricLabel}>Volume</Text>
              <Text style={styles.metricValue}>
                {formatAnalyticsVolumeKg(weekly.previousWeekVolumeKg)}
              </Text>
            </View>
          </View>
        </View>
      </AppCard>
    </View>
  );
}
