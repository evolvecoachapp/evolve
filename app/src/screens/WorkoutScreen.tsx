import { StyleSheet, View } from "react-native";
import { AppHeader } from "../components/AppHeader";
import { GradientBackground } from "../components/GradientBackground";
import { TabScreenContainer } from "../components/TabScreenContainer";
import {
  WorkoutExercisePreviewList,
  WorkoutPreviewHero,
  WorkoutStartFooter,
} from "../features/workout/components";
import { useWorkout } from "../features/workout/hooks";
import {
  countWorkingSets,
  formatMuscleGroups,
  formatSessionDifficulty,
  toLegacyWorkoutExercise,
  toPresentationDay,
} from "../features/workout/utils";
import { floatingFooterMetrics } from "../theme/theme";
import { useThemedStyles } from "../theme/useThemedStyles";

export function WorkoutScreen() {
  const { workout, loading } = useWorkout();

  const styles = useThemedStyles(() =>
    StyleSheet.create({
      screen: {
        flex: 1,
        backgroundColor: "transparent",
      },
    }),
  );

  if (loading || !workout) {
    return null;
  }

  const presentationDay = toPresentationDay(workout);
  const legacyExercises = workout.exercises.map(toLegacyWorkoutExercise);
  const workingSetCount = countWorkingSets(presentationDay);
  const muscleGroups = formatMuscleGroups(legacyExercises);
  const sessionDifficulty = formatSessionDifficulty(presentationDay);
  const footerReserve = floatingFooterMetrics.scrollReserve(
    floatingFooterMetrics.workoutContentHeight,
  );

  return (
    <GradientBackground variant="canvas">
      <View style={styles.screen}>
        <AppHeader title="Workout" subtitle="Your session briefing" />
        <TabScreenContainer gradient={false} footerReserve={footerReserve}>
          <WorkoutPreviewHero
            programName={workout.title}
            weekLabel={workout.scheduleLabels.weekLabel}
            dayLabel={workout.scheduleLabels.dayLabel}
            focus={workout.subtitle}
            durationMinutes={workout.estimatedDuration}
            workingSetCount={workingSetCount}
            sessionDifficulty={sessionDifficulty}
            muscleGroups={muscleGroups}
          />

          <WorkoutExercisePreviewList exercises={legacyExercises} />
        </TabScreenContainer>

        <WorkoutStartFooter
          exerciseCount={workout.exercises.length}
          durationMinutes={workout.estimatedDuration}
        />
      </View>
    </GradientBackground>
  );
}
