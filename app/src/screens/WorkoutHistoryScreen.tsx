import { router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { EmptyState } from "../components/EmptyState";
import { GradientBackground } from "../components/GradientBackground";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { ScreenContainer } from "../components/ScreenContainer";
import { SettingsHeader } from "../components/SettingsHeader";
import { WorkoutHistoryCard } from "../features/workout/components";
import { useWorkoutHistory } from "../features/workout/hooks";
import type { CompletedWorkout } from "../features/workout/models/CompletedWorkout";
import type { WorkoutHistoryRepository } from "../features/workout/repository";
import { spacing } from "../theme/theme";
import { useThemedStyles } from "../theme/useThemedStyles";

interface WorkoutHistoryScreenProps {
  /** Injectable for tests — defaults to the production repository via the hook. */
  repository?: WorkoutHistoryRepository;
}

/**
 * Workout History timeline backed by `WorkoutHistoryRepository`.
 * Presentation only — data loads through `useWorkoutHistory` / application layer.
 */
export function WorkoutHistoryScreen({ repository }: WorkoutHistoryScreenProps = {}) {
  const { sessions, loading, error } = useWorkoutHistory({ repository });
  const styles = useThemedStyles(({ colors, typography }) =>
    StyleSheet.create({
      screen: {
        flex: 1,
        backgroundColor: "transparent",
      },
      list: {
        gap: spacing.md,
      },
      message: {
        ...typography.callout,
        color: colors.inkMuted,
        textAlign: "center",
      },
    }),
  );

  const handleCardPress = (workout: CompletedWorkout) => {
    router.push({
      pathname: "/(app)/workout/detail",
      params: { sessionId: workout.sessionId },
    });
  };

  return (
    <GradientBackground variant="canvas">
      <View style={styles.screen}>
        <SettingsHeader title="Workout History" />
        <ScreenContainer gradient={false} withHeader={false}>
          {loading ? (
            <LoadingSpinner />
          ) : error ? (
            <Text style={styles.message}>{error}</Text>
          ) : sessions.length === 0 ? (
            <EmptyState
              icon="barbell-outline"
              title="No workouts yet"
              subtitle="Finish a session and it will show up here."
            />
          ) : (
            <View style={styles.list} testID="workout-history-list">
              {sessions.map((workout) => (
                <WorkoutHistoryCard
                  key={workout.id}
                  workout={workout}
                  onPress={handleCardPress}
                />
              ))}
            </View>
          )}
        </ScreenContainer>
      </View>
    </GradientBackground>
  );
}
