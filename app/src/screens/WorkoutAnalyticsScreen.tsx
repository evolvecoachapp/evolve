import { StyleSheet, Text, View } from "react-native";
import { GradientBackground } from "../components/GradientBackground";
import { ScreenContainer } from "../components/ScreenContainer";
import { SettingsHeader } from "../components/SettingsHeader";
import {
  AnalyticsEmptyState,
  AnalyticsHero,
  AnalyticsKpiGrid,
  ExerciseHighlightsCard,
  VolumeTrendChart,
  WeeklySummaryCard,
  WeeklyVolumeChart,
  WorkoutFrequencyChart,
  useWorkoutAnalytics,
} from "../features/analytics";
import type { WorkoutAnalyticsRepository } from "../features/analytics";
import { spacing } from "../theme/theme";
import { useThemedStyles } from "../theme/useThemedStyles";

interface WorkoutAnalyticsScreenProps {
  /** Injectable for tests — defaults to the production repository via the hook. */
  repository?: WorkoutAnalyticsRepository;
}

/**
 * Workout Analytics Dashboard.
 * Presentation only — all data comes from `useWorkoutAnalytics()`.
 */
export function WorkoutAnalyticsScreen({
  repository,
}: WorkoutAnalyticsScreenProps = {}) {
  const {
    workout,
    exercises,
    weekly,
    volumeTrend,
    workoutFrequency,
    loading,
    error,
  } = useWorkoutAnalytics({ repository });

  const styles = useThemedStyles(({ colors, typography }) =>
    StyleSheet.create({
      screen: {
        flex: 1,
        backgroundColor: "transparent",
      },
      stack: {
        gap: spacing.section,
      },
      message: {
        ...typography.callout,
        color: colors.inkMuted,
        textAlign: "center",
      },
    }),
  );

  const frequencyPoints = workoutFrequency?.points ?? [];
  const currentWeekWorkouts =
    frequencyPoints.length > 0
      ? frequencyPoints[frequencyPoints.length - 1]!.value
      : 0;
  const previousWeekWorkouts =
    frequencyPoints.length > 1
      ? frequencyPoints[frequencyPoints.length - 2]!.value
      : 0;

  const isEmpty = workout != null && workout.totalWorkouts === 0;

  return (
    <GradientBackground variant="canvas">
      <View style={styles.screen}>
        <SettingsHeader title="Analytics" />
        <ScreenContainer gradient={false} withHeader={false}>
          {loading ? (
            <View style={styles.stack} testID="workout-analytics-loading">
              <VolumeTrendChart loading />
              <WorkoutFrequencyChart loading />
              <WeeklyVolumeChart loading />
            </View>
          ) : error ? (
            <Text style={styles.message}>{error}</Text>
          ) : isEmpty || workout == null || weekly == null ? (
            <AnalyticsEmptyState />
          ) : (
            <View style={styles.stack} testID="workout-analytics-content">
              <AnalyticsHero workout={workout} />
              <AnalyticsKpiGrid workout={workout} />
              <WeeklySummaryCard
                weekly={weekly}
                currentWeekWorkouts={currentWeekWorkouts}
                previousWeekWorkouts={previousWeekWorkouts}
              />
              <VolumeTrendChart trend={volumeTrend} />
              <WorkoutFrequencyChart trend={workoutFrequency} />
              <WeeklyVolumeChart weekly={weekly} />
              <ExerciseHighlightsCard exercises={exercises} />
            </View>
          )}
        </ScreenContainer>
      </View>
    </GradientBackground>
  );
}
