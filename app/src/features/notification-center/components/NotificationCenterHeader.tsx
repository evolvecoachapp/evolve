import { View } from "react-native";
import { HeroSection } from "../../../components/HeroSection";
import { StatCard } from "../../../components/StatCard";
import { spacing } from "../../../theme/theme";
import { useThemedStyles } from "../../../theme/useThemedStyles";
import type { NotificationStatistics } from "../models";

export interface NotificationCenterHeaderProps {
  readonly statistics: NotificationStatistics;
}

export function NotificationCenterHeader({ statistics }: NotificationCenterHeaderProps) {
  const styles = useThemedStyles(() => ({
    row: { flexDirection: "row" as const, gap: spacing.md },
  }));

  return (
    <HeroSection
      overline="Notification Center"
      title="Notifications"
      subtitle="Stay on track with reminders and coach insights."
      variant="gradient"
    >
      <View style={styles.row}>
        <StatCard
          label="Unread"
          value={statistics.unreadCount}
          unit="notifications"
          icon="mail-unread-outline"
          embedded
        />
        <StatCard
          label="Reminders"
          value={statistics.activeReminders}
          unit="active"
          icon="alarm-outline"
          embedded
        />
      </View>
    </HeroSection>
  );
}
