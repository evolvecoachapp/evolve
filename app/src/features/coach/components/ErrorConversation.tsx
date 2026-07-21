import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import { AnimatedPressable } from "../../../animation/AnimatedPressable";
import { AppCard } from "../../../components/AppCard";
import { useTheme } from "../../../theme/ThemeContext";
import { spacing } from "../../../theme/theme";
import { useThemedStyles } from "../../../theme/useThemedStyles";

export interface ErrorConversationProps {
  /** Friendly message — never raw HTTP errors. */
  message?: string;
  onRetry?: () => void;
}

const DEFAULT_MESSAGE =
  "Something went wrong with this conversation. Please try again.";

/** Friendly conversation error card with retry — presentation only. */
export function ErrorConversation({
  message = DEFAULT_MESSAGE,
  onRetry,
}: ErrorConversationProps) {
  const { colors } = useTheme();
  const styles = useThemedStyles(({ colors, typography }) =>
    StyleSheet.create({
      card: {
        marginBottom: 0,
        gap: spacing.md,
        alignItems: "flex-start",
      },
      iconWrap: {
        width: spacing.avatar.md,
        height: spacing.avatar.md,
        borderRadius: spacing.avatar.md / 2,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.warmMuted,
      },
      title: {
        ...typography.title3,
        color: colors.ink,
      },
      body: {
        ...typography.callout,
        color: colors.inkMuted,
      },
      retryButton: {
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.sm,
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.lg,
        borderRadius: spacing.md,
        backgroundColor: colors.ink,
      },
      retryLabel: {
        ...typography.bodyMedium,
        color: colors.textOnInk,
      },
    }),
  );

  return (
    <View accessibilityRole="alert">
      <AppCard variant="glass" glow style={styles.card}>
        <View style={styles.iconWrap}>
          <Ionicons name="alert-circle" size={spacing.icon.md} color={colors.warm} />
        </View>
        <Text style={styles.title}>Couldn’t load Coach</Text>
        <Text style={styles.body}>{message}</Text>
        {onRetry ? (
          <AnimatedPressable
            accessibilityRole="button"
            accessibilityLabel="Retry conversation"
            onPress={onRetry}
            haptic="light"
            style={styles.retryButton}
          >
            <Ionicons
              name="refresh"
              size={spacing.icon.sm}
              color={colors.textOnInk}
            />
            <Text style={styles.retryLabel}>Try again</Text>
          </AnimatedPressable>
        ) : null}
      </AppCard>
    </View>
  );
}
