import { useEffect, useRef, useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { AppHeader } from "../components/AppHeader";
import { GradientBackground } from "../components/GradientBackground";
import { TabScreenContainer } from "../components/TabScreenContainer";
import {
  WorkoutExercisePreviewList,
  WorkoutPreviewHero,
  WorkoutStartFooter,
} from "../features/workout/components";
import { useWorkout } from "../features/workout/hooks";
import type { WorkoutSession } from "../features/workout/models/WorkoutSession";
import { setPendingSession, workoutService } from "../features/workout/services";
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
  const { workout, loading, error } = useWorkout();
  const [starting, setStarting] = useState(false);
  // Tapping "Start Workout" while a session is already `in_progress` should
  // resume it rather than start a duplicate (the backend rejects a second
  // concurrent session with a 409) — checked silently, no layout/label change.
  const activeSessionRef = useRef<WorkoutSession | null>(null);

  useEffect(() => {
    let cancelled = false;
    void workoutService
      .getActiveSession()
      .then((session) => {
        if (!cancelled) {
          activeSessionRef.current = session;
        }
      })
      .catch(() => {
        // Resume detection is a best-effort convenience — fall through to a normal start on failure.
      });
    return () => {
      cancelled = true;
    };
  }, []);

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
    }),
  );

  if (loading) {
    return null;
  }

  if (error || !workout) {
    return (
      <GradientBackground variant="canvas">
        <View style={styles.screen}>
          <AppHeader title="Workout" subtitle="Your session briefing" />
          <TabScreenContainer gradient={false}>
            <Text style={styles.message}>
              {error ?? "No workout is scheduled for today."}
            </Text>
          </TabScreenContainer>
        </View>
      </GradientBackground>
    );
  }

  const presentationDay = toPresentationDay(workout);
  const legacyExercises = workout.exercises.map(toLegacyWorkoutExercise);
  const workingSetCount = countWorkingSets(presentationDay);
  const muscleGroups = formatMuscleGroups(legacyExercises);
  const sessionDifficulty = formatSessionDifficulty(presentationDay);
  const footerReserve = floatingFooterMetrics.scrollReserve(
    floatingFooterMetrics.workoutContentHeight,
  );

  const handleStartPress = async () => {
    if (!workout || starting) {
      return;
    }

    setStarting(true);

    try {
      const session = activeSessionRef.current ?? (await workoutService.startWorkout(workout.id));
      setPendingSession(session);
      router.push({
        pathname: "/(app)/workout/session",
        params: { sessionId: session.id },
      });
    } catch (startWorkoutError) {
      Alert.alert(
        "Unable to start workout",
        startWorkoutError instanceof Error
          ? startWorkoutError.message
          : "Failed to start workout.",
      );
    } finally {
      setStarting(false);
    }
  };

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
          onStartPress={() => void handleStartPress()}
          disabled={starting}
        />
      </View>
    </GradientBackground>
  );
}
