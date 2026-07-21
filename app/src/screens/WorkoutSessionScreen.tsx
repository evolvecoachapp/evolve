import { router } from "expo-router";
import { useCallback, useRef } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  type NativeMethods,
} from "react-native";
import { GradientBackground } from "../components/GradientBackground";
import { ScreenContainer } from "../components/ScreenContainer";
import { SettingsHeader } from "../components/SettingsHeader";
import type { WorkoutSession } from "../features/training/application";
import {
  SessionExerciseList,
  SessionHero,
  SessionProgressionReferences,
  SessionRestTimer,
  WorkoutSessionFooter,
} from "../features/workout/components";
import { useLocalSessionInteraction } from "../features/workout/hooks/useLocalSessionInteraction";
import { useSessionFinish } from "../features/workout/hooks/useSessionFinish";
import { useSessionTiming } from "../features/workout/hooks/useSessionTiming";
import { setPendingSessionSummary } from "../features/workout/services";
import {
  findSessionSetRef,
  formatUpcomingSetLabel,
} from "../features/workout/utils/sessionSetFlow";
import {
  countSessionSets,
  estimateSessionDurationMinutes,
} from "../features/workout/utils/sessionPresentationFormatters";
import { floatingFooterMetrics, spacing } from "../theme/theme";
import { useThemedStyles } from "../theme/useThemedStyles";

interface WorkoutSessionScreenProps {
  /** Application-layer session id (route param). */
  sessionId: string;
  /** Immutable executable session from `WorkoutSessionBuilder` via handoff. */
  session?: WorkoutSession | null;
}

/**
 * Interactive executable session view (local UI state only).
 * Orchestrates interaction + timing hooks; does not persist, sync,
 * or touch the Training Engine / WorkoutSessionBuilder.
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
  const timing = useSessionTiming(session, interaction.execution);
  const finish = useSessionFinish(
    session,
    interaction.execution,
    interaction.interactionStatus,
  );

  const scrollRef = useRef<ScrollView>(null);
  const contentOffsetYRef = useRef(0);
  const scrollWindowYRef = useRef(0);

  const setCount = countSessionSets(session.exercises);
  const durationMinutes = estimateSessionDurationMinutes(session);
  const footerReserve = finish.canFinish
    ? floatingFooterMetrics.scrollReserve(floatingFooterMetrics.workoutContentHeight)
    : 0;

  const upcomingRef =
    timing.rest.upcomingSetId !== null
      ? findSessionSetRef(session, timing.rest.upcomingSetId)
      : null;

  const handleCompleteSet = useCallback(
    (setId: string, defaultReps: number) => {
      interaction.completeSet(setId, defaultReps);
      timing.afterSetCompleted(setId);
    },
    [interaction, timing],
  );

  const handleSkipSet = useCallback(
    (setId: string) => {
      interaction.skipSet(setId);
      timing.afterSetSkipped(setId);
    },
    [interaction, timing],
  );

  const handleUncompleteSet = useCallback(
    (setId: string) => {
      interaction.uncompleteSet(setId);
      timing.syncActiveSet();
    },
    [interaction, timing],
  );

  const handleUnskipSet = useCallback(
    (setId: string) => {
      interaction.unskipSet(setId);
      timing.syncActiveSet();
    },
    [interaction, timing],
  );

  const handleActiveSetLayout = useCallback((windowY: number) => {
    const delta = windowY - scrollWindowYRef.current - spacing.lg;
    if (Math.abs(delta) < 12) {
      return;
    }
    scrollRef.current?.scrollTo({
      y: Math.max(0, contentOffsetYRef.current + delta),
      animated: true,
    });
  }, []);

  const handleFinishWorkout = useCallback(() => {
    if (!finish.canFinish) {
      return;
    }
    const summary = finish.buildSummary();
    setPendingSessionSummary(summary);
    router.push({
      pathname: "/(app)/workout/complete",
      params: { sessionId: summary.sessionId },
    });
  }, [finish]);

  const finishSummaryLabel = `${interaction.sessionProgress.completedSets} logged · ${interaction.sessionProgress.skippedSets} skipped`;

  return (
    <GradientBackground variant="canvas">
      <View style={styles.screen}>
        <SettingsHeader title="Workout Session" />
        <ScreenContainer
          gradient={false}
          withHeader={false}
          footerReserve={footerReserve}
          ref={scrollRef}
          onScroll={(event) => {
            contentOffsetYRef.current = event.nativeEvent.contentOffset.y;
          }}
          scrollEventThrottle={16}
          onLayout={(event) => {
            scrollWindowYRef.current = event.nativeEvent.layout.y;
            // Prefer window coordinates when available after mount.
            const scrollView = scrollRef.current as (ScrollView & NativeMethods) | null;
            scrollView?.measureInWindow((_x: number, y: number) => {
              scrollWindowYRef.current = y;
            });
          }}
        >
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

            <SessionRestTimer
              rest={timing.rest}
              upcomingExerciseName={upcomingRef?.exerciseName ?? null}
              upcomingSetLabel={upcomingRef ? formatUpcomingSetLabel(upcomingRef) : null}
              onPause={timing.pauseRest}
              onResume={timing.resumeRest}
              onSkip={timing.skipRest}
            />

            <SessionExerciseList
              exercises={session.exercises}
              getSetState={interaction.getSetState}
              getExerciseProgress={interaction.getExerciseProgress}
              activeSetId={timing.activeSetId}
              onCompleteSet={handleCompleteSet}
              onUncompleteSet={handleUncompleteSet}
              onSkipSet={handleSkipSet}
              onUnskipSet={handleUnskipSet}
              onUpdateCompletedReps={interaction.updateCompletedReps}
              onUpdateCompletedLoad={interaction.updateCompletedLoad}
              onActiveSetLayout={handleActiveSetLayout}
            />

            <SessionProgressionReferences references={session.progressionReferences} />
          </View>
        </ScreenContainer>

        {finish.canFinish ? (
          <WorkoutSessionFooter
            label="Finish Workout"
            summary={finishSummaryLabel}
            onPress={handleFinishWorkout}
            aboveTabBar={false}
          />
        ) : null}
      </View>
    </GradientBackground>
  );
}
