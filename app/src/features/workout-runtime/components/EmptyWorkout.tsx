import { EmptyState } from "../../../components/EmptyState";
import { AppCard } from "../../../components/AppCard";
import { Pressable, Text, View } from "react-native";
import { spacing } from "../../../theme/theme";
import { useThemedStyles } from "../../../theme/useThemedStyles";

interface EmptyWorkoutProps {
  readonly title?: string;
  readonly subtitle?: string;
  readonly actionLabel?: string;
  readonly onAction?: () => void;
}

/** Empty workout runtime state — presentation only. */
export function EmptyWorkout({
  title = "No workout today",
  subtitle = "Your training session will appear here when a workout is available.",
  actionLabel,
  onAction,
}: EmptyWorkoutProps = {}) {
  const styles = useThemedStyles(({ colors, typography }) => ({
    body: {
      gap: spacing.md,
    },
    action: {
      alignSelf: "center" as const,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.lg,
      minHeight: spacing["3xl"],
      justifyContent: "center" as const,
    },
    actionLabel: {
      ...typography.caption,
      color: colors.pulse,
      fontWeight: "700" as const,
    },
  }));

  return (
    <AppCard variant="elevated">
      <View style={styles.body}>
        <EmptyState
          icon="barbell-outline"
          title={title}
          subtitle={subtitle}
        />
        {actionLabel && onAction ? (
          <Pressable
            onPress={onAction}
            style={styles.action}
            accessibilityRole="button"
            accessibilityLabel={actionLabel}
          >
            <Text style={styles.actionLabel}>{actionLabel}</Text>
          </Pressable>
        ) : null}
      </View>
    </AppCard>
  );
}
