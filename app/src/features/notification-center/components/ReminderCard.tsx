import { Text, View } from "react-native";
import { AppCard } from "../../../components/AppCard";
import { spacing } from "../../../theme/theme";
import { useThemedStyles } from "../../../theme/useThemedStyles";
import type { Reminder } from "../models";

export interface ReminderCardProps {
  readonly reminder: Reminder;
  readonly onPress?: () => void;
}

export function ReminderCard({ reminder, onPress }: ReminderCardProps) {
  const styles = useThemedStyles(({ colors, typography }) => ({
    body: { gap: spacing.xs },
    header: { flexDirection: "row" as const, justifyContent: "space-between" as const },
    title: { ...typography.callout },
    badge: { ...typography.caption, color: reminder.enabled ? colors.pulse : colors.inkMuted },
    message: { ...typography.body, color: colors.inkMuted },
    meta: { ...typography.caption, color: colors.inkMuted },
  }));

  return (
    <AppCard variant="floating" onPress={onPress}>
      <View style={styles.body}>
        <View style={styles.header}>
          <Text style={styles.title}>{reminder.title}</Text>
          <Text style={styles.badge}>{reminder.enabled ? "Active" : "Paused"}</Text>
        </View>
        <Text style={styles.message}>{reminder.message}</Text>
        <Text style={styles.meta}>{reminder.type} · {reminder.schedule.timeOfDay} · {reminder.deliveryPolicy}</Text>
      </View>
    </AppCard>
  );
}
