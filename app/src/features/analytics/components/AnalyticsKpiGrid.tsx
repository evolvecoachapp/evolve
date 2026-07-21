import { StyleSheet, View } from "react-native";
import { spacing } from "../../../theme/theme";
import { useThemedStyles } from "../../../theme/useThemedStyles";
import type { WorkoutAnalytics } from "../models/WorkoutAnalytics";
import { AnalyticsKpiCard } from "./AnalyticsKpiCard";
import {
  formatAnalyticsCount,
  formatAnalyticsVolumeKg,
} from "./formatAnalyticsDisplay";

export interface AnalyticsKpiGridProps {
  workout: WorkoutAnalytics;
}

/** Responsive KPI grid: workouts, sets, reps, volume. */
export function AnalyticsKpiGrid({ workout }: AnalyticsKpiGridProps) {
  const styles = useThemedStyles(() =>
    StyleSheet.create({
      grid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: spacing.md,
      },
    }),
  );

  return (
    <View style={styles.grid} testID="analytics-kpi-grid">
      <AnalyticsKpiCard
        label="Total Workouts"
        value={formatAnalyticsCount(workout.totalWorkouts)}
        icon="barbell-outline"
      />
      <AnalyticsKpiCard
        label="Total Sets"
        value={formatAnalyticsCount(workout.totalSets)}
        icon="layers-outline"
      />
      <AnalyticsKpiCard
        label="Total Reps"
        value={formatAnalyticsCount(workout.totalReps)}
        icon="repeat-outline"
      />
      <AnalyticsKpiCard
        label="Total Volume"
        value={formatAnalyticsVolumeKg(workout.totalVolumeKg)}
        icon="fitness-outline"
      />
    </View>
  );
}
