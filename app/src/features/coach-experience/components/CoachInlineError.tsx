import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";
import { AppCard } from "../../../components/AppCard";
import { useTheme } from "../../../theme/ThemeContext";
import { spacing } from "../../../theme/theme";
import { useThemedStyles } from "../../../theme/useThemedStyles";
import type { CoachErrorState } from "../models/CoachErrorState";

interface CoachInlineErrorProps {
  readonly error: CoachErrorState;
  readonly onRetry?: () => void;
}

/**
 * Compact, feature-level error banner for a failed send/regenerate turn.
 * Unlike `CoachError`, this never replaces the existing conversation —
 * it renders alongside it so the athlete keeps their message history.
 */
export function CoachInlineError({ error, onRetry }: CoachInlineErrorProps) {
  const { colors } = useTheme();
  const styles = useThemedStyles(({ colors, typography }) => ({
    row: {
      flexDirection: "row" as const,
      alignItems: "center" as const,
      gap: spacing.sm,
    },
    message: {
      ...typography.callout,
      color: colors.critical,
      flex: 1,
    },
    retry: {
      paddingVertical: spacing.xs,
      paddingHorizontal: spacing.sm,
    },
    retryLabel: {
      ...typography.caption,
      color: colors.pulse,
      fontWeight: "700" as const,
    },
  }));

  return (
    <AppCard variant="accent" padding="compact">
      <View
        style={styles.row}
        accessible
        accessibilityRole="alert"
        accessibilityLabel={`Coach could not respond: ${error.message}`}
      >
        <Ionicons name="alert-circle-outline" size={20} color={colors.critical} />
        <Text style={styles.message}>{error.message}</Text>
        {error.retryable && onRetry ? (
          <Pressable
            onPress={onRetry}
            style={styles.retry}
            accessibilityRole="button"
            accessibilityLabel="Try sending again"
          >
            <Text style={styles.retryLabel}>Retry</Text>
          </Pressable>
        ) : null}
      </View>
    </AppCard>
  );
}
