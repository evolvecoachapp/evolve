import { Pressable, Text, View } from "react-native";
import { EmptyState } from "../../../components/EmptyState";
import { AppCard } from "../../../components/AppCard";
import { spacing } from "../../../theme/theme";
import { useThemedStyles } from "../../../theme/useThemedStyles";
import type { CoachErrorState } from "../models/CoachErrorState";

interface CoachErrorProps {
  readonly error: CoachErrorState;
  readonly onRetry?: () => void;
}

/** Error coach experience state — presentation only. */
export function CoachError({ error, onRetry }: CoachErrorProps) {
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
          title="Couldn't load Coach"
          subtitle={error.message}
        />
        {error.retryable && onRetry ? (
          <Pressable
            onPress={onRetry}
            style={styles.retry}
            accessibilityRole="button"
            accessibilityLabel="Retry loading Coach"
          >
            <Text style={styles.retryLabel}>Try again</Text>
          </Pressable>
        ) : null}
      </View>
    </AppCard>
  );
}
