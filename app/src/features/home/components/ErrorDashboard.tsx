import { Pressable, Text, View } from "react-native";
import { EmptyState } from "../../../components/EmptyState";
import { AppCard } from "../../../components/AppCard";
import { spacing } from "../../../theme/theme";
import { useThemedStyles } from "../../../theme/useThemedStyles";
import type { HomeErrorState } from "../models/HomeErrorState";
import { DashboardSection } from "./DashboardSection";

interface ErrorDashboardProps {
  readonly error: HomeErrorState;
  readonly onRetry?: () => void;
}

/** Error Home dashboard state — presentation only. */
export function ErrorDashboard({ error, onRetry }: ErrorDashboardProps) {
  const styles = useThemedStyles(({ colors, typography }) => ({
    body: {
      gap: spacing.md,
    },
    message: {
      ...typography.callout,
      color: colors.inkMuted,
      textAlign: "center" as const,
    },
    retry: {
      alignSelf: "center" as const,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.lg,
    },
    retryLabel: {
      ...typography.caption,
      color: colors.pulse,
      fontWeight: "700" as const,
    },
  }));

  return (
    <DashboardSection title="Home">
      <AppCard variant="elevated">
        <View style={styles.body}>
          <EmptyState
            icon="alert-circle-outline"
            title="Couldn't load Home"
            subtitle={error.message}
          />
          {error.retryable && onRetry ? (
            <Pressable
              onPress={onRetry}
              style={styles.retry}
              accessibilityRole="button"
              accessibilityLabel="Retry loading Home"
            >
              <Text style={styles.retryLabel}>Try again</Text>
            </Pressable>
          ) : null}
        </View>
      </AppCard>
    </DashboardSection>
  );
}
