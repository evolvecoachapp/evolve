import { StyleSheet, Text, View } from "react-native";
import { AppButton } from "../../../components/AppButton";
import { AppCard } from "../../../components/AppCard";
import { ProgressBar } from "../../../components/ProgressBar";
import { spacing } from "../../../theme/theme";
import { useThemedStyles } from "../../../theme/useThemedStyles";

interface RestTimerOverlayProps {
  secondsLeft: number;
  totalSeconds: number;
  onSkipRest: () => void;
  onAddTime: () => void;
  onSubtractTime: () => void;
  /** e.g. "Back Squat · Set 3 of 4" — what the athlete moves to once rest ends. */
  nextLabel?: string | null;
}

function formatCountdown(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

export function RestTimerOverlay({
  secondsLeft,
  totalSeconds,
  onSkipRest,
  onAddTime,
  onSubtractTime,
  nextLabel,
}: RestTimerOverlayProps) {
  const styles = useThemedStyles(({ colors, typography }) =>
    StyleSheet.create({
      card: {
        alignItems: "center",
        gap: spacing.md,
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
      timer: {
        ...typography.display,
        color: colors.ink,
        fontVariant: ["tabular-nums"],
      },
      nextLabel: {
        ...typography.callout,
        color: colors.inkSecondary,
        textAlign: "center",
      },
      progressTrack: {
        width: "100%",
      },
      adjustRow: {
        flexDirection: "row",
        gap: spacing.sm,
        width: "100%",
      },
      adjustButton: {
        flex: 1,
      },
      skipButton: {
        alignSelf: "stretch",
      },
    }),
  );

  const progress = totalSeconds > 0 ? (secondsLeft / totalSeconds) * 100 : 0;

  return (
    <AppCard variant="elevated" style={styles.card}>
      <Text style={styles.label}>Rest</Text>
      <Text style={styles.timer}>{formatCountdown(secondsLeft)}</Text>
      {nextLabel ? <Text style={styles.nextLabel}>Up next · {nextLabel}</Text> : null}

      <ProgressBar progress={progress} style={styles.progressTrack} height={6} />

      <View style={styles.adjustRow}>
        <AppButton
          label="-10s"
          variant="ghost"
          size="sm"
          onPress={onSubtractTime}
          style={styles.adjustButton}
        />
        <AppButton
          label="+10s"
          variant="ghost"
          size="sm"
          onPress={onAddTime}
          style={styles.adjustButton}
        />
      </View>

      <AppButton
        label="Skip Rest"
        variant="secondary"
        onPress={onSkipRest}
        style={styles.skipButton}
      />
    </AppCard>
  );
}
