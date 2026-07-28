import { Pressable, StyleSheet, Text, View } from "react-native";
import { AppCard } from "../../../components/AppCard";
import { spacing } from "../../../theme/theme";
import { useThemedStyles } from "../../../theme/useThemedStyles";
import type { CoachInsight } from "../models/CoachInsight";

interface InsightCardProps {
  readonly insight: CoachInsight;
  readonly title?: string;
  readonly onPress?: () => void;
  readonly onPin?: () => void;
  readonly onDismiss?: () => void;
}

/** Insight card — presentation only. */
export function InsightCard({
  insight,
  title,
  onPress,
  onPin,
  onDismiss,
}: InsightCardProps) {
  const styles = useThemedStyles(({ colors, typography }) =>
    StyleSheet.create({
      sectionTitle: {
        ...typography.caption,
        color: colors.inkMuted,
        fontWeight: "700",
        textTransform: "uppercase",
        letterSpacing: 0.6,
        marginBottom: spacing.sm,
      },
      body: {
        gap: spacing.sm,
      },
      title: {
        ...typography.title3,
        color: colors.ink,
      },
      text: {
        ...typography.bodyRelaxed,
        color: colors.inkSecondary,
      },
      actions: {
        flexDirection: "row",
        gap: spacing.md,
        marginTop: spacing.xs,
      },
      action: {
        minHeight: spacing["3xl"],
        justifyContent: "center",
        paddingHorizontal: spacing.xs,
      },
      actionLabel: {
        ...typography.caption,
        color: colors.pulse,
        fontWeight: "600",
      },
    }),
  );

  return (
    <View>
      {title ? <Text style={styles.sectionTitle}>{title}</Text> : null}
      <AppCard variant="glass" onPress={onPress}>
        <View style={styles.body}>
          <Text style={styles.title}>{insight.title}</Text>
          <Text style={styles.text}>{insight.body}</Text>
          <View style={styles.actions}>
            {onPin && !insight.pinned ? (
              <Pressable
                onPress={onPin}
                style={styles.action}
                accessibilityRole="button"
                accessibilityLabel="Pin insight"
              >
                <Text style={styles.actionLabel}>Pin</Text>
              </Pressable>
            ) : null}
            {onDismiss ? (
              <Pressable
                onPress={onDismiss}
                style={styles.action}
                accessibilityRole="button"
                accessibilityLabel="Dismiss insight"
              >
                <Text style={styles.actionLabel}>Dismiss</Text>
              </Pressable>
            ) : null}
          </View>
        </View>
      </AppCard>
    </View>
  );
}
