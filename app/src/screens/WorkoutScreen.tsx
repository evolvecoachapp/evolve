import { StyleSheet, Text, View } from "react-native";
import { AppHeader } from "../components/AppHeader";
import { GradientBackground } from "../components/GradientBackground";
import { TabScreenContainer } from "../components/TabScreenContainer";
import {
  ProgramDayExerciseList,
  ProgramPreviewHero,
  ProgramProgressionSection,
  ProgramWeeklySchedule,
} from "../features/workout/components";
import { useWorkoutProgramPreview } from "../features/workout/hooks";
import { useThemedStyles } from "../theme/useThemedStyles";

export function WorkoutScreen() {
  const { preview, selectedDay, selectDay, error } = useWorkoutProgramPreview();

  const styles = useThemedStyles((theme) =>
    StyleSheet.create({
      screen: {
        flex: 1,
        backgroundColor: "transparent",
      },
      message: {
        color: theme.colors.textSecondary,
        fontSize: 16,
        lineHeight: 24,
        textAlign: "center",
        paddingHorizontal: 24,
      },
      stack: {
        gap: theme.spacing.xl,
      },
    }),
  );

  if (error || !preview || !selectedDay) {
    return (
      <GradientBackground variant="canvas">
        <View style={styles.screen}>
          <AppHeader title="Workout" subtitle="Your training program" />
          <TabScreenContainer gradient={false}>
            <Text style={styles.message}>
              {error ?? "Unable to generate a workout program preview."}
            </Text>
          </TabScreenContainer>
        </View>
      </GradientBackground>
    );
  }

  const trainingDayCount = preview.weeklySchedule.days.filter((day) => !day.isRestDay).length;
  const restDayCount = preview.weeklySchedule.days.filter((day) => day.isRestDay).length;

  return (
    <GradientBackground variant="canvas">
      <View style={styles.screen}>
        <AppHeader title="Workout" subtitle="Your training program" />
        <TabScreenContainer gradient={false}>
          <View style={styles.stack}>
            <ProgramPreviewHero
              title={preview.title}
              goalLabel={preview.goalLabel}
              durationLabel={preview.durationLabel}
              splitTypeLabel={preview.weeklySchedule.splitTypeLabel}
              description={preview.description}
              trainingDayCount={trainingDayCount}
              restDayCount={restDayCount}
            />

            <ProgramWeeklySchedule
              scheduleName={preview.weeklySchedule.name}
              days={preview.weeklySchedule.days}
              selectedDayId={selectedDay.id}
              onSelectDay={selectDay}
            />

            <ProgramDayExerciseList day={selectedDay} />

            <ProgramProgressionSection summaries={preview.progressionSummary} />
          </View>
        </TabScreenContainer>
      </View>
    </GradientBackground>
  );
}
