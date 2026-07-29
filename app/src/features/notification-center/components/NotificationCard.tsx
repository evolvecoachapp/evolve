import { Text, View } from "react-native";
import { AppCard } from "../../../components/AppCard";
import { spacing } from "../../../theme/theme";
import { useThemedStyles } from "../../../theme/useThemedStyles";
import type { NotificationItem } from "../models";

export interface NotificationCardProps {
  readonly notification: NotificationItem;
  readonly onDismiss?: () => void;
  readonly onPress?: () => void;
}

export function NotificationCard({ notification, onDismiss, onPress }: NotificationCardProps) {
  const styles = useThemedStyles(({ colors, typography }) => ({
    body: { gap: spacing.xs },
    header: { flexDirection: "row" as const, justifyContent: "space-between" as const, alignItems: "center" as const },
    title: { ...typography.callout, flex: 1 },
    priority: { ...typography.caption, color: notification.priority === "high" || notification.priority === "urgent" ? colors.pulse : colors.inkMuted },
    message: { ...typography.body, color: colors.inkMuted },
    meta: { ...typography.caption, color: colors.inkMuted },
    actions: { flexDirection: "row" as const, gap: spacing.sm, marginTop: spacing.xs },
    actionLabel: { ...typography.caption, color: colors.pulse },
    dismiss: { ...typography.caption, color: colors.inkMuted },
  }));

  return (
    <AppCard variant={notification.readAt ? "floating" : "accent"} onPress={onPress}>
      <View style={styles.body}>
        <View style={styles.header}>
          <Text style={styles.title} numberOfLines={1}>{notification.title}</Text>
          <Text style={styles.priority}>{notification.priority}</Text>
        </View>
        <Text style={styles.message}>{notification.message}</Text>
        <Text style={styles.meta}>{notification.category} · {notification.state}</Text>
        {notification.actions.length > 0 || onDismiss ? (
          <View style={styles.actions}>
            {notification.actions.map((action) => (
              <Text key={action.id} style={styles.actionLabel}>{action.label}</Text>
            ))}
            {onDismiss ? <Text style={styles.dismiss} onPress={onDismiss}>Dismiss</Text> : null}
          </View>
        ) : null}
      </View>
    </AppCard>
  );
}
