import { Pressable, Text, View } from "react-native";
import { AppCard } from "../../../components/AppCard";
import { Chip } from "../../../components/Chip";
import { spacing } from "../../../theme/theme";
import { useThemedStyles } from "../../../theme/useThemedStyles";
import type { Reminder } from "../models";

export interface ReminderCardProps {
  readonly reminder: Reminder;
  readonly onPress?: () => void;
  /** Toggles `enabled` — omitted when reminder edits are unavailable. */
  readonly onToggleEnabled?: () => void;
  /** Removes the reminder — omitted when reminder deletion is unavailable. */
  readonly onRemove?: () => void;
  readonly disabled?: boolean;
}

export function ReminderCard({
  reminder,
  onPress,
  onToggleEnabled,
  onRemove,
  disabled = false,
}: ReminderCardProps) {
  const styles = useThemedStyles(({ colors, typography }) => ({
    body: { gap: spacing.xs },
    header: {
      flexDirection: "row" as const,
      alignItems: "center" as const,
      justifyContent: "space-between" as const,
    },
    title: { ...typography.callout },
    message: { ...typography.body, color: colors.inkMuted },
    meta: { ...typography.caption, color: colors.inkMuted },
    actions: {
      flexDirection: "row" as const,
      alignItems: "center" as const,
      gap: spacing.md,
      marginTop: spacing.xs,
    },
    removeLabel: { ...typography.caption, color: colors.critical, fontWeight: "600" as const },
    remove: { minHeight: spacing["2xl"], justifyContent: "center" as const, paddingHorizontal: spacing.xs },
  }));

  return (
    <AppCard variant="floating" onPress={onPress}>
      <View style={styles.body}>
        <View style={styles.header}>
          <Text style={styles.title}>{reminder.title}</Text>
          {onToggleEnabled ? (
            <Chip
              label={reminder.enabled ? "Active" : "Paused"}
              variant={reminder.enabled ? "selected" : "outline"}
              size="sm"
              disabled={disabled}
              onPress={onToggleEnabled}
            />
          ) : (
            <Chip
              label={reminder.enabled ? "Active" : "Paused"}
              variant={reminder.enabled ? "accent" : "neutral"}
              size="sm"
            />
          )}
        </View>
        <Text style={styles.message}>{reminder.message}</Text>
        <Text style={styles.meta}>
          {reminder.type} · {reminder.schedule.timeOfDay} · {reminder.deliveryPolicy}
        </Text>
        {onRemove ? (
          <View style={styles.actions}>
            <Pressable
              onPress={onRemove}
              disabled={disabled}
              style={({ pressed }) => [
                styles.remove,
                disabled && { opacity: 0.5 },
                pressed && !disabled && { opacity: 0.7 },
              ]}
              accessibilityRole="button"
              accessibilityLabel={`Remove ${reminder.title} reminder`}
              accessibilityState={{ disabled }}
              hitSlop={8}
            >
              <Text style={styles.removeLabel}>Remove</Text>
            </Pressable>
          </View>
        ) : null}
      </View>
    </AppCard>
  );
}
