import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { AppHeader } from "../components/AppHeader";
import { GradientBackground } from "../components/GradientBackground";
import { TabScreenContainer } from "../components/TabScreenContainer";
import { useTheme } from "../theme/ThemeContext";
import {
  ProgramDayExerciseList,
  ProgramPreviewHero,
  ProgramProgressionSection,
  ProgramWeeklySchedule,
  WorkoutStartFooter,
} from "../features/workout/components";
import { useStartWorkoutSession, useWorkoutProgramPreview } from "../features/workout/hooks";
import { setPendingExecutableSession } from "../features/workout/services";
import { estimatePreviewDayDurationMinutes } from "../features/workout/utils/sessionPresentationFormatters";
import { floatingFooterMetrics } from "../theme/theme";
import { useThemedStyles } from "../theme/useThemedStyles";

export function WorkoutScreen() {
  const { colors } = useTheme();
  const { preview, selectedDay, selectDay, error } = useWorkoutProgramPreview();
  const { startSession, canStart } = useStartWorkoutSession();
  const [starting, setStarting] = useState(false);

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
      headerActions: {
        flexDirection: "row",
        alignItems: "center",
        gap: theme.spacing.sm,
      },
      headerButton: {
        width: theme.spacing["2xl"],
        height: theme.spacing["2xl"],
        borderRadius: theme.spacing.md,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: theme.colors.overlayStrong,
      },
    }),
  );

  const headerActions = (
    <View style={styles.headerActions}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Workout analytics"
        onPress={() => router.push("/(app)/workout/analytics")}
        style={({ pressed }) => [styles.headerButton, pressed && { opacity: 0.7 }]}
      >
        <Ionicons name="analytics-outline" size={22} color={colors.ink} />
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Workout history"
        onPress={() => router.push("/(app)/workout/history")}
        style={({ pressed }) => [styles.headerButton, pressed && { opacity: 0.7 }]}
      >
        <Ionicons name="time-outline" size={22} color={colors.ink} />
      </Pressable>
    </View>
  );

  if (error || !preview || !selectedDay) {
    return (
      <GradientBackground variant="canvas">
        <View style={styles.screen}>
          <AppHeader
            title="Workout"
            subtitle="Your training program"
            rightAction={headerActions}
          />
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
  const startEnabled = canStart(selectedDay);
  const durationMinutes = estimatePreviewDayDurationMinutes(selectedDay);
  const footerReserve = floatingFooterMetrics.scrollReserve(
    floatingFooterMetrics.workoutContentHeight,
  );

  const handleStartPress = () => {
    if (!startEnabled || starting) {
      return;
    }

    setStarting(true);
    try {
      const session = startSession(preview, selectedDay);
      setPendingExecutableSession(session);
      router.push({
        pathname: "/(app)/workout/session",
        params: { sessionId: session.id },
      });
    } catch (startError: unknown) {
      Alert.alert(
        "Unable to start workout",
        startError instanceof Error ? startError.message : "Failed to start workout.",
      );
    } finally {
      setStarting(false);
    }
  };

  return (
    <GradientBackground variant="canvas">
      <View style={styles.screen}>
        <AppHeader
          title="Workout"
          subtitle="Your training program"
          rightAction={headerActions}
        />
        <TabScreenContainer gradient={false} footerReserve={footerReserve}>
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

        <WorkoutStartFooter
          exerciseCount={selectedDay.isRestDay ? 0 : selectedDay.exercises.length}
          durationMinutes={durationMinutes}
          onStartPress={handleStartPress}
          disabled={!startEnabled || starting}
        />
      </View>
    </GradientBackground>
  );
}
