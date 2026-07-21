import { router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { EmptyState } from "../components/EmptyState";
import { GradientBackground } from "../components/GradientBackground";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { ScreenContainer } from "../components/ScreenContainer";
import { SettingsHeader } from "../components/SettingsHeader";
import {
  WorkoutDetailFooter,
  WorkoutDetailHero,
  WorkoutExerciseCard,
  WorkoutMetricsGrid,
} from "../features/workout/components";
import { useWorkoutDetail } from "../features/workout/hooks";
import type { WorkoutHistoryRepository } from "../features/workout/repository";
import { spacing } from "../theme/theme";
import { useThemedStyles } from "../theme/useThemedStyles";

interface WorkoutDetailScreenProps {
  sessionId?: string;
  /** Injectable for tests — defaults to the production repository via the hook. */
  repository?: WorkoutHistoryRepository;
}

/**
 * Workout Detail experience backed by `WorkoutHistoryRepository`.
 * Presentation only — data loads through `useWorkoutDetail` / application layer.
 */
export function WorkoutDetailScreen({
  sessionId,
  repository,
}: WorkoutDetailScreenProps) {
  const { workout, loading, error, notFound } = useWorkoutDetail({
    sessionId,
    repository,
  });
  const styles = useThemedStyles(({ colors, typography }) =>
    StyleSheet.create({
      screen: {
        flex: 1,
        backgroundColor: "transparent",
      },
      content: {
        gap: spacing.xl,
        paddingBottom: spacing["3xl"] + spacing["3xl"],
      },
      section: {
        gap: spacing.md,
      },
      sectionTitle: {
        ...typography.title3,
        color: colors.ink,
      },
      message: {
        ...typography.callout,
        color: colors.inkMuted,
        textAlign: "center",
      },
      exerciseList: {
        gap: spacing.md,
      },
    }),
  );

  const handleBack = () => {
    router.replace("/(app)/workout/history");
  };

  return (
    <GradientBackground variant="canvas">
      <View style={styles.screen}>
        <SettingsHeader title="Workout Detail" />
        <ScreenContainer gradient={false} withHeader={false}>
          {loading ? (
            <LoadingSpinner />
          ) : error ? (
            <Text style={styles.message}>{error}</Text>
          ) : notFound || !workout ? (
            <EmptyState
              icon="barbell-outline"
              title="Workout not found"
              subtitle="This session is missing from your history."
            />
          ) : (
            <View style={styles.content} testID="workout-detail-content">
              <WorkoutDetailHero
                title={workout.title}
                programName={workout.programName}
                completedAt={workout.completedAt}
              />
              <WorkoutMetricsGrid workout={workout} />
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Exercises</Text>
                <View style={styles.exerciseList}>
                  {workout.exercises.map((exercise, index) => (
                    <WorkoutExerciseCard
                      key={exercise.id}
                      exercise={exercise}
                      exerciseNumber={index + 1}
                      exerciseTotal={workout.exercises.length}
                    />
                  ))}
                </View>
              </View>
            </View>
          )}
        </ScreenContainer>
        {!loading && workout ? (
          <WorkoutDetailFooter
            summary={`${workout.completedSets} sets · ${workout.totalExercises} exercises`}
            onBack={handleBack}
          />
        ) : null}
      </View>
    </GradientBackground>
  );
}
