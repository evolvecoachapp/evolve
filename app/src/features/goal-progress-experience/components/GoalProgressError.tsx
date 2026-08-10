import { Pressable, StyleSheet, Text, View } from "react-native";
import { AppCard } from "../../../components/AppCard";
import { spacing } from "../../../theme/theme";
import { useThemedStyles } from "../../../theme/useThemedStyles";
import type { GoalProgressErrorState } from "../models";

export interface GoalProgressErrorProps {
  readonly error: GoalProgressErrorState;
  readonly onRetry?: () => void;
}

export function GoalProgressError({ error, onRetry }: GoalProgressErrorProps) {
  const styles = useThemedStyles(({ colors, typography }) =>
    StyleSheet.create({
      body: { gap: spacing.sm },
      title: { ...typography.title3 },
      message: { ...typography.bodyRelaxed, color: colors.inkSecondary },
      retry: { ...typography.callout, color: colors.pulse },
    }),
  );

  return (
    <AppCard variant="floating">
      <View style={styles.body}>
        <Text style={styles.title}>Goal Progress unavailable</Text>
        <Text style={styles.message}>{error.message}</Text>
        {error.retryable && onRetry ? (
          <Pressable onPress={onRetry}>
            <Text style={styles.retry}>Try again</Text>
          </Pressable>
        ) : null}
      </View>
    </AppCard>
  );
}
