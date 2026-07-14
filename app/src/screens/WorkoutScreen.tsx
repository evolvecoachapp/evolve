import { StyleSheet, View } from "react-native";
import { AppHeader } from "../components/AppHeader";
import { GradientBackground } from "../components/GradientBackground";
import { TabScreenContainer } from "../components/TabScreenContainer";
import {
  WorkoutExercisePreviewList,
  WorkoutPreviewHero,
  WorkoutStartFooter,
} from "../features/workout/components";
import { useWorkoutDay, useWorkoutProgram } from "../features/workout/hooks";
import {
  countWorkingSets,
  formatMuscleGroups,
  formatSessionDifficulty,
} from "../features/workout/utils";
import { floatingFooterMetrics } from "../theme/theme";
import { useThemedStyles } from "../theme/useThemedStyles";

/** Mock cursor — today's scheduled slot until backend resolution is wired. */
const TODAY_WEEK = 1;
const TODAY_DAY = 1;

export function WorkoutScreen() {
  const program = useWorkoutProgram();
  const day = useWorkoutDay(TODAY_WEEK, TODAY_DAY);

  const styles = useThemedStyles(() =>
    StyleSheet.create({
      screen: {
        flex: 1,
        backgroundColor: "transparent",
      },
    }),
  );

  if (!day) {
    return null;
  }

  const week = program.weeks.find((entry) => entry.weekNumber === TODAY_WEEK);
  const workingSetCount = countWorkingSets(day);
  const muscleGroups = formatMuscleGroups(day.exercises);
  const sessionDifficulty = formatSessionDifficulty(day);
  const footerReserve = floatingFooterMetrics.scrollReserve(
    floatingFooterMetrics.workoutContentHeight,
  );

  return (
    <GradientBackground variant="canvas">
      <View style={styles.screen}>
        <AppHeader title="Workout" subtitle="Your session briefing" />
        <TabScreenContainer gradient={false} footerReserve={footerReserve}>
          <WorkoutPreviewHero
            programName={program.name}
            weekLabel={week?.label ?? `Week ${TODAY_WEEK}`}
            dayLabel={day.label}
            focus={day.focus}
            durationMinutes={day.estimatedDurationMinutes}
            workingSetCount={workingSetCount}
            sessionDifficulty={sessionDifficulty}
            muscleGroups={muscleGroups}
          />

          <WorkoutExercisePreviewList exercises={day.exercises} />
        </TabScreenContainer>

        <WorkoutStartFooter
          exerciseCount={day.exercises.length}
          durationMinutes={day.estimatedDurationMinutes}
        />
      </View>
    </GradientBackground>
  );
}
