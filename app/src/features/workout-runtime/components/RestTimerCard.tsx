import { Text, View } from "react-native";
import { AppButton } from "../../../components/AppButton";
import { AppCard } from "../../../components/AppCard";
import { ProgressBar } from "../../../components/ProgressBar";
import { spacing } from "../../../theme/theme";
import { useThemedStyles } from "../../../theme/useThemedStyles";
import type { WorkoutTimer } from "../models/experience/WorkoutTimer";
import { WorkoutTimerStatuses } from "../models/experience/WorkoutTimer";

interface RestTimerCardProps {
  readonly timer: WorkoutTimer;
  readonly onPause: () => void;
  readonly onResume: () => void;
}

function formatSeconds(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

/** Rest timer card — presentation only. */
export function RestTimerCard({
  timer,
  onPause,
  onResume,
}: RestTimerCardProps) {
  const styles = useThemedStyles(({ colors, typography }) => ({
    body: {
      alignItems: "center" as const,
      gap: spacing.md,
    },
    label: {
      ...typography.caption,
      color: colors.pulse,
      fontWeight: "700" as const,
      textTransform: "uppercase" as const,
      letterSpacing: 0.6,
    },
    time: {
      ...typography.title1,
      color: colors.ink,
    },
    status: {
      ...typography.callout,
      color: colors.inkMuted,
    },
    progress: {
      width: "100%" as const,
    },
  }));

  if (
    timer.status === WorkoutTimerStatuses.IDLE ||
    timer.status === WorkoutTimerStatuses.COMPLETED
  ) {
    return null;
  }

  const isPaused = timer.status === WorkoutTimerStatuses.PAUSED;
  const elapsedPercent =
    timer.targetSeconds > 0
      ? Math.min(100, (timer.elapsedSeconds / timer.targetSeconds) * 100)
      : 100;

  return (
    <AppCard variant="floating" glow>
      <View style={styles.body}>
        <Text style={styles.label}>{timer.label}</Text>
        <Text style={styles.time}>
          {formatSeconds(timer.remainingSeconds)}
        </Text>
        <Text style={styles.status}>
          {isPaused
            ? "Paused"
            : timer.isOvertime
              ? "Overtime"
              : "Rest in progress"}
        </Text>
        {timer.targetSeconds > 0 ? (
          <ProgressBar progress={elapsedPercent} style={styles.progress} />
        ) : null}
        <AppButton
          label={isPaused ? "Resume" : "Pause"}
          onPress={isPaused ? onResume : onPause}
          variant="secondary"
          size="lg"
          interaction="floating"
        />
      </View>
    </AppCard>
  );
}
