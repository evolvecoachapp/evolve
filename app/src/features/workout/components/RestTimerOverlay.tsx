import { StyleSheet, View } from "react-native";
import Animated from "react-native-reanimated";
import { heroEntering } from "../../../animation/entering";
import { useReduceMotion } from "../../../animation/useReduceMotion";
import { AppButton } from "../../../components/AppButton";
import { AppCard } from "../../../components/AppCard";
import { spacing } from "../../../theme/theme";
import { useThemedStyles } from "../../../theme/useThemedStyles";
import { CircularCountdown } from "./CircularCountdown";
import { RestUpNextCard } from "./RestUpNextCard";

interface RestTimerOverlayProps {
  secondsLeft: number;
  totalSeconds: number;
  onSkipRest: () => void;
  onAddTime: () => void;
  onSubtractTime: () => void;
  nextExerciseName?: string | null;
  nextSetLabel?: string | null;
  nextMuscleGroupLabel?: string | null;
}

export function RestTimerOverlay({
  secondsLeft,
  totalSeconds,
  onSkipRest,
  onAddTime,
  onSubtractTime,
  nextExerciseName,
  nextSetLabel,
  nextMuscleGroupLabel,
}: RestTimerOverlayProps) {
  const reduceMotion = useReduceMotion();
  const styles = useThemedStyles(({ colors, typography }) =>
    StyleSheet.create({
      card: {
        alignItems: "center",
        gap: spacing.lg,
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

  const showUpNext = Boolean(nextExerciseName && nextSetLabel);

  return (
    <Animated.View entering={heroEntering(0, reduceMotion)}>
      <AppCard variant="elevated" style={styles.card}>
        <CircularCountdown secondsLeft={secondsLeft} totalSeconds={totalSeconds} />

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

        {showUpNext ? (
          <RestUpNextCard
            exerciseName={nextExerciseName!}
            setLabel={nextSetLabel!}
            muscleGroupLabel={nextMuscleGroupLabel ?? undefined}
          />
        ) : null}
      </AppCard>
    </Animated.View>
  );
}
