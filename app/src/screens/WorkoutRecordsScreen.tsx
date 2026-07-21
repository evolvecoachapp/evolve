import { StyleSheet, Text, View } from "react-native";
import { GradientBackground } from "../components/GradientBackground";
import { ScreenContainer } from "../components/ScreenContainer";
import { SettingsHeader } from "../components/SettingsHeader";
import { SkeletonBlock } from "../components/Skeleton";
import {
  ExerciseRecordCard,
  LifetimeStatsCard,
  RecordCard,
  RecordHero,
  RecordsEmptyState,
  useWorkoutRecords,
} from "../features/records";
import type { WorkoutRecordsRepository } from "../features/records";
import { radius, spacing } from "../theme/theme";
import { useThemedStyles } from "../theme/useThemedStyles";

interface WorkoutRecordsScreenProps {
  /** Injectable for tests — defaults to the production repository via the hook. */
  repository?: WorkoutRecordsRepository;
}

/**
 * Workout Personal Records Dashboard.
 * Presentation only — all data comes from `useWorkoutRecords()`.
 */
export function WorkoutRecordsScreen({
  repository,
}: WorkoutRecordsScreenProps = {}) {
  const { workoutRecord, exercises, summary, loading, error } =
    useWorkoutRecords({ repository });

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
      skeletonCard: {
        gap: spacing.md,
        padding: spacing.lg,
        borderRadius: radius.lg,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.surfaceElevated,
      },
    }),
  );

  const isEmpty = summary != null && summary.totalLifetimeSessions === 0;

  return (
    <GradientBackground variant="canvas">
      <View style={styles.screen}>
        <SettingsHeader title="Records" />
        <ScreenContainer gradient={false} withHeader={false}>
          {loading ? (
            <View style={styles.stack} testID="workout-records-loading">
              <View style={styles.skeletonCard}>
                <SkeletonBlock height={28} width="55%" />
                <SkeletonBlock height={18} width="80%" />
                <SkeletonBlock height={72} />
              </View>
              <View style={styles.skeletonCard}>
                <SkeletonBlock height={22} width="40%" />
                <SkeletonBlock height={96} />
              </View>
              <View style={styles.skeletonCard}>
                <SkeletonBlock height={22} width="45%" />
                <SkeletonBlock height={120} />
              </View>
            </View>
          ) : error ? (
            <Text style={styles.message}>{error}</Text>
          ) : isEmpty || workoutRecord == null || summary == null ? (
            <RecordsEmptyState />
          ) : (
            <View style={styles.stack} testID="workout-records-content">
              <RecordHero summary={summary} workoutRecord={workoutRecord} />
              <LifetimeStatsCard summary={summary} />
              <RecordCard workoutRecord={workoutRecord} />
              <ExerciseRecordCard exercises={exercises} />
            </View>
          )}
        </ScreenContainer>
      </View>
    </GradientBackground>
  );
}
