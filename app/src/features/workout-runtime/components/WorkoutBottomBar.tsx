import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppButton } from "../../../components/AppButton";
import { spacing } from "../../../theme/theme";
import { useThemedStyles } from "../../../theme/useThemedStyles";

interface WorkoutBottomBarProps {
  readonly onCompleteSet: () => void;
  readonly onSkipExercise: () => void;
  readonly onPrevious: () => void;
  readonly onNext: () => void;
  readonly onFinish: () => void;
  readonly canCompleteSet: boolean;
  readonly canFinish: boolean;
  readonly completeLabel?: string;
}

/** Bottom action bar — large one-handed targets, presentation only. */
export function WorkoutBottomBar({
  onCompleteSet,
  onSkipExercise,
  onPrevious,
  onNext,
  onFinish,
  canCompleteSet,
  canFinish,
  completeLabel = "Complete set",
}: WorkoutBottomBarProps) {
  const insets = useSafeAreaInsets();
  const styles = useThemedStyles(({ colors }) => ({
    container: {
      position: "absolute" as const,
      left: 0,
      right: 0,
      bottom: 0,
      paddingHorizontal: spacing.screenPadding,
      paddingTop: spacing.md,
      paddingBottom: Math.max(insets.bottom, spacing.md),
      backgroundColor: colors.canvas,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      gap: spacing.sm,
    },
    row: {
      flexDirection: "row" as const,
      gap: spacing.sm,
    },
    flex: {
      flex: 1,
    },
  }));

  return (
    <View style={styles.container}>
      <AppButton
        label={completeLabel}
        onPress={onCompleteSet}
        size="lg"
        interaction="floating"
        disabled={!canCompleteSet}
      />
      <View style={styles.row}>
        <View style={styles.flex}>
          <AppButton
            label="Previous"
            onPress={onPrevious}
            variant="secondary"
            size="md"
          />
        </View>
        <View style={styles.flex}>
          <AppButton
            label="Next"
            onPress={onNext}
            variant="secondary"
            size="md"
          />
        </View>
      </View>
      <View style={styles.row}>
        <View style={styles.flex}>
          <AppButton
            label="Skip exercise"
            onPress={onSkipExercise}
            variant="ghost"
            size="md"
          />
        </View>
        <View style={styles.flex}>
          <AppButton
            label="Finish"
            onPress={onFinish}
            variant="destructive"
            size="md"
            disabled={!canFinish}
          />
        </View>
      </View>
    </View>
  );
}
