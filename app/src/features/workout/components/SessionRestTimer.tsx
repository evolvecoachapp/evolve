import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated from "react-native-reanimated";
import { heroEntering } from "../../../animation/entering";
import { useReduceMotion } from "../../../animation/useReduceMotion";
import { spacing } from "../../../theme/theme";
import { useThemedStyles } from "../../../theme/useThemedStyles";
import type { SessionRestSnapshot } from "../types/sessionTiming";
import { CircularCountdown } from "./CircularCountdown";

interface SessionRestTimerProps {
  rest: SessionRestSnapshot;
  upcomingExerciseName?: string | null;
  upcomingSetLabel?: string | null;
  onPause: () => void;
  onResume: () => void;
  onSkip: () => void;
}

/**
 * Local rest countdown for the interactive session screen.
 * Presentation only — pause / resume / skip live in `useSessionTiming`.
 */
export function SessionRestTimer({
  rest,
  upcomingExerciseName,
  upcomingSetLabel,
  onPause,
  onResume,
  onSkip,
}: SessionRestTimerProps) {
  const reduceMotion = useReduceMotion();
  const styles = useThemedStyles(({ colors, typography, radius }) =>
    StyleSheet.create({
      card: {
        alignItems: "center",
        gap: spacing.lg,
        padding: spacing.lg,
        borderRadius: radius.lg,
        borderWidth: 1,
        borderColor: colors.borderPulse,
        backgroundColor: colors.pulseMuted,
      },
      label: {
        ...typography.caption,
        color: colors.pulse,
        fontWeight: "700",
        textTransform: "uppercase",
        letterSpacing: 0.8,
      },
      status: {
        ...typography.callout,
        color: colors.inkSecondary,
        fontWeight: "600",
      },
      upNext: {
        width: "100%",
        gap: spacing.xs,
        paddingTop: spacing.sm,
        borderTopWidth: 1,
        borderTopColor: colors.border,
      },
      upNextEyebrow: {
        ...typography.caption,
        color: colors.inkMuted,
        fontWeight: "600",
        textTransform: "uppercase",
        letterSpacing: 0.6,
      },
      upNextTitle: {
        ...typography.title3,
        color: colors.ink,
      },
      upNextSet: {
        ...typography.caption,
        color: colors.pulse,
        fontWeight: "600",
      },
      actions: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: spacing.sm,
        width: "100%",
      },
      actionButton: {
        flex: 1,
        minWidth: 96,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: radius.sm,
        borderWidth: 1,
        borderColor: colors.borderStrong,
        backgroundColor: "transparent",
        alignItems: "center",
      },
      actionPrimary: {
        borderColor: colors.borderPulse,
        backgroundColor: colors.surfaceElevated,
      },
      actionPressed: {
        opacity: spacing.interaction.chipPressedOpacity,
      },
      actionLabel: {
        ...typography.caption,
        color: colors.inkSecondary,
        fontWeight: "600",
      },
      actionLabelPrimary: {
        color: colors.pulse,
      },
    }),
  );

  if (rest.status === "idle") {
    return null;
  }

  const isPaused = rest.status === "paused";
  const showUpNext = Boolean(upcomingExerciseName && upcomingSetLabel);

  return (
    <Animated.View entering={heroEntering(0, reduceMotion)}>
      <View
        style={styles.card}
        accessibilityLabel={`Rest timer ${rest.secondsLeft} seconds remaining`}
      >
        <Text style={styles.label}>Rest</Text>
        <CircularCountdown secondsLeft={rest.secondsLeft} totalSeconds={rest.totalSeconds} />
        <Text style={styles.status}>{isPaused ? "Paused" : "In progress"}</Text>

        <View style={styles.actions}>
          {isPaused ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Resume rest timer"
              onPress={onResume}
              style={({ pressed }) => [
                styles.actionButton,
                styles.actionPrimary,
                pressed ? styles.actionPressed : null,
              ]}
            >
              <Text style={[styles.actionLabel, styles.actionLabelPrimary]}>Resume</Text>
            </Pressable>
          ) : (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Pause rest timer"
              onPress={onPause}
              style={({ pressed }) => [
                styles.actionButton,
                styles.actionPrimary,
                pressed ? styles.actionPressed : null,
              ]}
            >
              <Text style={[styles.actionLabel, styles.actionLabelPrimary]}>Pause</Text>
            </Pressable>
          )}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Skip rest timer"
            onPress={onSkip}
            style={({ pressed }) => [
              styles.actionButton,
              pressed ? styles.actionPressed : null,
            ]}
          >
            <Text style={styles.actionLabel}>Skip</Text>
          </Pressable>
        </View>

        {showUpNext ? (
          <View style={styles.upNext}>
            <Text style={styles.upNextEyebrow}>Up next</Text>
            <Text style={styles.upNextTitle}>{upcomingExerciseName}</Text>
            <Text style={styles.upNextSet}>{upcomingSetLabel}</Text>
          </View>
        ) : null}
      </View>
    </Animated.View>
  );
}
