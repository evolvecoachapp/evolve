import { Text, View } from "react-native";
import { AppCard } from "../../../components/AppCard";
import { spacing } from "../../../theme/theme";
import { useThemedStyles } from "../../../theme/useThemedStyles";
import type { TimelineErrorState } from "../models";

export interface TimelineErrorProps {
  readonly error: TimelineErrorState;
  readonly onRetry?: () => void;
}

export function TimelineError({ error, onRetry }: TimelineErrorProps) {
  const styles = useThemedStyles(({ colors, typography }) => ({
    body: { gap: spacing.sm },
    title: { ...typography.title3 },
    message: { ...typography.body, color: colors.inkMuted },
    retry: { ...typography.callout, color: colors.pulse },
  }));

  return (
    <AppCard variant="accent" onPress={onRetry}>
      <View style={styles.body}>
        <Text style={styles.title}>Unable to load timeline</Text>
        <Text style={styles.message}>{error.message}</Text>
        {onRetry ? <Text style={styles.retry}>Tap to retry</Text> : null}
      </View>
    </AppCard>
  );
}
