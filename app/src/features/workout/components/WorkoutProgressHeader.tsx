import { StyleSheet, Text, View } from "react-native";
import Animated from "react-native-reanimated";
import { heroEntering } from "../../../animation/entering";
import { useReduceMotion } from "../../../animation/useReduceMotion";
import { ProgressBar } from "../../../components/ProgressBar";
import { spacing } from "../../../theme/theme";
import { useThemedStyles } from "../../../theme/useThemedStyles";

interface WorkoutProgressHeaderProps {
  completedSets: number;
  totalSets: number;
  sessionProgress: number;
  exerciseProgress?: number | null;
  exerciseLabel?: string | null;
  elapsedLabel: string;
}

function formatElapsed(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

/** Dual progress header — overall session plus current exercise. */
export function WorkoutProgressHeader({
  completedSets,
  totalSets,
  sessionProgress,
  exerciseProgress,
  exerciseLabel,
  elapsedLabel,
}: WorkoutProgressHeaderProps) {
  const reduceMotion = useReduceMotion();
  const styles = useThemedStyles(({ colors, typography }) =>
    StyleSheet.create({
      container: {
        gap: spacing.md,
      },
      row: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
      },
      label: {
        ...typography.caption,
        color: colors.inkSecondary,
        fontWeight: "600",
      },
      section: {
        gap: spacing.xs,
      },
      exerciseSection: {
        gap: spacing.xs,
        paddingTop: spacing.xs,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: colors.border,
      },
    }),
  );

  return (
    <Animated.View entering={heroEntering(0, reduceMotion)} style={styles.container}>
      <View style={styles.section}>
        <View style={styles.row}>
          <Text style={styles.label}>
            Workout · {completedSets} / {totalSets} sets
          </Text>
          <Text style={styles.label}>{elapsedLabel}</Text>
        </View>
        <ProgressBar progress={sessionProgress} height={6} />
      </View>

      {exerciseProgress !== null && exerciseProgress !== undefined && exerciseLabel ? (
        <View style={styles.exerciseSection}>
          <Text style={styles.label}>{exerciseLabel}</Text>
          <ProgressBar progress={exerciseProgress} height={4} />
        </View>
      ) : null}
    </Animated.View>
  );
}

export { formatElapsed };
