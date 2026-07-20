import { StyleSheet, Text, View } from "react-native";
import { GradientBackground } from "../components/GradientBackground";
import { ScreenContainer } from "../components/ScreenContainer";
import { SettingsHeader } from "../components/SettingsHeader";
import type { WorkoutSession } from "../features/training/application";
import {
  SessionExerciseList,
  SessionHero,
  SessionProgressionReferences,
} from "../features/workout/components";
import { useLocalSessionInteraction } from "../features/workout/hooks/useLocalSessionInteraction";
import {
  countSessionSets,
  estimateSessionDurationMinutes,
} from "../features/workout/utils/sessionPresentationFormatters";
import { spacing } from "../theme/theme";
import { useThemedStyles } from "../theme/useThemedStyles";

interface WorkoutSessionScreenProps {
  /** Application-layer session id (route param). */
  sessionId: string;
  /** Immutable executable session from `WorkoutSessionBuilder` via handoff. */
  session?: WorkoutSession | null;
}

/**
 * Interactive executable session view (local UI state only).
 * Consumes `useLocalSessionInteraction` for mark/skip/edit; does not persist,
 * sync, run timers, or touch the Training Engine / WorkoutSessionBuilder.
 */
export function WorkoutSessionScreen({ sessionId, session }: WorkoutSessionScreenProps) {
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
        paddingHorizontal: spacing.screenPadding,
      },
      content: {
        gap: spacing.xl,
      },
    }),
  );

  if (!session || session.id !== sessionId) {
    return (
      <GradientBackground variant="canvas">
        <View style={styles.screen}>
          <SettingsHeader title="Workout Session" />
          <ScreenContainer gradient={false} withHeader={false}>
            <Text style={styles.message}>
              Workout session not found. Return to Workout and press Start Workout again.
            </Text>
          </ScreenContainer>
        </View>
      </GradientBackground>
    );
  }

  return <WorkoutSessionScreenContent session={session} />;
}

function WorkoutSessionScreenContent({ session }: { session: WorkoutSession }) {
  const styles = useThemedStyles(() =>
    StyleSheet.create({
      screen: {
        flex: 1,
        backgroundColor: "transparent",
      },
      content: {
        gap: spacing.xl,
      },
    }),
  );

  const interaction = useLocalSessionInteraction(session);
  const setCount = countSessionSets(session.exercises);
  const durationMinutes = estimateSessionDurationMinutes(session);

  return (
    <GradientBackground variant="canvas">
      <View style={styles.screen}>
        <SettingsHeader title="Workout Session" />
        <ScreenContainer gradient={false} withHeader={false}>
          <View style={styles.content}>
            <SessionHero
              title={session.title}
              subtitle={session.subtitle}
              goalLabel={session.goalLabel}
              exerciseCount={session.exercises.length}
              setCount={setCount}
              durationMinutes={durationMinutes}
              primaryFocus={session.primaryFocus}
              interactionStatus={interaction.interactionStatus}
              completedSets={interaction.sessionProgress.completedSets}
              accountedSets={interaction.sessionProgress.accountedSets}
              sessionProgressPercent={interaction.sessionProgress.percent}
            />

            <SessionExerciseList
              exercises={session.exercises}
              getSetState={interaction.getSetState}
              getExerciseProgress={interaction.getExerciseProgress}
              onCompleteSet={interaction.completeSet}
              onUncompleteSet={interaction.uncompleteSet}
              onSkipSet={interaction.skipSet}
              onUnskipSet={interaction.unskipSet}
              onUpdateCompletedReps={interaction.updateCompletedReps}
              onUpdateCompletedLoad={interaction.updateCompletedLoad}
            />

            <SessionProgressionReferences references={session.progressionReferences} />
          </View>
        </ScreenContainer>
      </View>
    </GradientBackground>
  );
}
