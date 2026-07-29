import { Text, View } from "react-native";
import { AppCard } from "../../../components/AppCard";
import { spacing } from "../../../theme/theme";
import { useThemedStyles } from "../../../theme/useThemedStyles";
import type { CoachNotification } from "../models";

export interface CoachNotificationCardProps {
  readonly notification: CoachNotification;
  readonly onPress?: () => void;
}

export function CoachNotificationCard({ notification, onPress }: CoachNotificationCardProps) {
  const styles = useThemedStyles(({ colors, typography }) => ({
    body: { gap: spacing.xs },
    title: { ...typography.callout },
    message: { ...typography.body, color: colors.inkMuted },
    context: { ...typography.caption, color: colors.pulse, fontStyle: "italic" as const },
    meta: { ...typography.caption, color: colors.inkMuted },
  }));

  return (
    <AppCard variant="accent" onPress={onPress}>
      <View style={styles.body}>
        <Text style={styles.title}>{notification.title}</Text>
        <Text style={styles.message}>{notification.message}</Text>
        {notification.coachContext ? <Text style={styles.context}>{notification.coachContext}</Text> : null}
        <Text style={styles.meta}>{notification.priority} · {notification.state}</Text>
      </View>
    </AppCard>
  );
}
