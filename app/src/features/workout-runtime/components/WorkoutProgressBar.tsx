import { Text, View } from "react-native";
import { ProgressBar } from "../../../components/ProgressBar";
import { spacing } from "../../../theme/theme";
import { useThemedStyles } from "../../../theme/useThemedStyles";
import type { WorkoutProgress } from "../models/experience/WorkoutProgress";

interface WorkoutProgressBarProps {
  readonly progress: WorkoutProgress;
}

/** Workout progress bar — presentation only. */
export function WorkoutProgressBar({ progress }: WorkoutProgressBarProps) {
  const styles = useThemedStyles(({ colors, typography }) => ({
    container: {
      gap: spacing.sm,
      marginBottom: spacing.md,
    },
    row: {
      flexDirection: "row" as const,
      justifyContent: "space-between" as const,
    },
    label: {
      ...typography.caption,
      color: colors.inkSecondary,
      fontWeight: "600" as const,
    },
  }));

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text style={styles.label}>Progress</Text>
        <Text style={styles.label}>{progress.completionPercent}%</Text>
      </View>
      <ProgressBar progress={progress.completionPercent} height={6} />
      <View style={styles.row}>
        <Text style={styles.label}>
          {progress.completedSets} done · {progress.remainingSets} left
        </Text>
        <Text style={styles.label}>
          ~{progress.estimatedRemainingMinutes} min left
        </Text>
      </View>
    </View>
  );
}
