import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppButton } from "../components/AppButton";
import { AppCard } from "../components/AppCard";
import { AppHeader } from "../components/AppHeader";
import { ScreenContainer } from "../components/ScreenContainer";
import { SectionTitle } from "../components/SectionTitle";
import { workoutMock } from "../data/mocks/workout";
import { colors, spacing, typography } from "../theme/theme";

export function WorkoutScreen() {
  const insets = useSafeAreaInsets();
  const { name, durationMinutes, muscleFocus, exercises } = workoutMock;

  return (
    <View style={styles.screen}>
      <AppHeader title="Workout" subtitle="Today's session" />
      <ScreenContainer contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}>
        <AppCard>
          <Text style={styles.workoutName}>{name}</Text>
          <Text style={styles.workoutFocus}>{muscleFocus}</Text>
          <View style={styles.metaRow}>
            <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
            <Text style={styles.metaText}>{durationMinutes} minutes estimated</Text>
          </View>
        </AppCard>

        <View>
          <SectionTitle title="Exercises" />
          <View style={styles.exerciseList}>
            {exercises.map((exercise, index) => (
              <AppCard key={exercise.name} style={styles.exerciseCard}>
                <View style={styles.exerciseRow}>
                  <View style={styles.exerciseIndex}>
                    <Text style={styles.exerciseIndexText}>{index + 1}</Text>
                  </View>
                  <View style={styles.exerciseInfo}>
                    <Text style={styles.exerciseName}>{exercise.name}</Text>
                    <Text style={styles.exerciseDetail}>
                      {exercise.sets} sets × {exercise.reps} reps
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
                </View>
              </AppCard>
            ))}
          </View>
        </View>
      </ScreenContainer>

      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}>
        <AppButton label="Start Workout" size="lg" onPress={() => {}} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  workoutName: {
    ...typography.h2,
    marginBottom: spacing.xs,
  },
  workoutFocus: {
    ...typography.bodySmall,
    marginBottom: spacing.md,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  metaText: {
    ...typography.caption,
  },
  exerciseList: {
    gap: spacing.md,
  },
  exerciseCard: {
    padding: spacing.md,
  },
  exerciseRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  exerciseIndex: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.overlay,
    alignItems: "center",
    justifyContent: "center",
  },
  exerciseIndexText: {
    ...typography.caption,
    fontWeight: "700",
  },
  exerciseInfo: {
    flex: 1,
    gap: 2,
  },
  exerciseName: {
    ...typography.body,
    fontWeight: "600",
  },
  exerciseDetail: {
    ...typography.caption,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.screenPadding,
    paddingTop: spacing.md,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
