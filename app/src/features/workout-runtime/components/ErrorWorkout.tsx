import { Pressable, Text, View } from "react-native";
import { EmptyState } from "../../../components/EmptyState";
import { AppCard } from "../../../components/AppCard";
import { spacing } from "../../../theme/theme";
import { useThemedStyles } from "../../../theme/useThemedStyles";
import type { WorkoutErrorState } from "../models/experience/WorkoutErrorState";

interface ErrorWorkoutProps {
  readonly error: WorkoutErrorState;
  readonly onRetry?: () => void;
}

/** Error workout runtime state — presentation only. */
export function ErrorWorkout({ error, onRetry }: ErrorWorkoutProps) {
  const styles = useThemedStyles(({ colors, typography }) => ({
    body: {
      gap: spacing.md,
    },
    retry: {
      alignSelf: "center" as const,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.lg,
      minHeight: spacing["3xl"],
      justifyContent: "center" as const,
    },
    retryLabel: {
      ...typography.caption,
      color: colors.pulse,
      fontWeight: "700" as const,
    },
  }));

  return (
    <AppCard variant="elevated">
      <View style={styles.body}>
        <EmptyState
          icon="alert-circle-outline"
          title="Couldn't load workout"
          subtitle={error.message}
        />
        {error.retryable && onRetry ? (
          <Pressable
            onPress={onRetry}
            style={styles.retry}
            accessibilityRole="button"
            accessibilityLabel="Retry loading workout"
          >
            <Text style={styles.retryLabel}>Try again</Text>
          </Pressable>
        ) : null}
      </View>
    </AppCard>
  );
}
