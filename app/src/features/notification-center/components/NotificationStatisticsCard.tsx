import { Text, View } from "react-native";
import { AppCard } from "../../../components/AppCard";
import { spacing } from "../../../theme/theme";
import { useThemedStyles } from "../../../theme/useThemedStyles";
import type { NotificationStatistics } from "../models";

export interface NotificationStatisticsCardProps {
  readonly statistics: NotificationStatistics;
}

export function NotificationStatisticsCard({ statistics }: NotificationStatisticsCardProps) {
  const styles = useThemedStyles(({ colors, typography }) => ({
    body: { gap: spacing.sm },
    title: { ...typography.title3 },
    row: { flexDirection: "row" as const, justifyContent: "space-between" as const },
    label: { ...typography.callout },
    value: { ...typography.callout, color: colors.inkMuted },
  }));

  const entries: readonly [string, number][] = [
    ["Total", statistics.totalNotifications],
    ["Unread", statistics.unreadCount],
    ["Dismissed", statistics.dismissedCount],
    ["Active Reminders", statistics.activeReminders],
    ["Delivered Today", statistics.deliveredToday],
    ["Pending", statistics.pendingCount],
  ];

  return (
    <AppCard variant="floating">
      <View style={styles.body}>
        <Text style={styles.title}>Statistics</Text>
        {entries.map(([label, value]) => (
          <View key={label} style={styles.row}>
            <Text style={styles.label}>{label}</Text>
            <Text style={styles.value}>{value}</Text>
          </View>
        ))}
      </View>
    </AppCard>
  );
}
