import { Text, View } from "react-native";
import { AppCard } from "../../../components/AppCard";
import { spacing } from "../../../theme/theme";
import { useThemedStyles } from "../../../theme/useThemedStyles";
import type { NotificationSettings } from "../models";

export interface NotificationSettingsCardProps {
  readonly settings: NotificationSettings;
}

export function NotificationSettingsCard({ settings }: NotificationSettingsCardProps) {
  const styles = useThemedStyles(({ colors, typography }) => ({
    body: { gap: spacing.sm },
    title: { ...typography.title3 },
    row: { flexDirection: "row" as const, justifyContent: "space-between" as const },
    label: { ...typography.callout },
    value: { ...typography.callout, color: colors.inkMuted },
  }));

  const entries: readonly [string, boolean | string][] = [
    ["Workout Reminders", settings.workoutReminders],
    ["Nutrition Reminders", settings.nutritionReminders],
    ["Hydration Reminders", settings.hydrationReminders],
    ["Recovery Reminders", settings.recoveryReminders],
    ["Sleep Reminders", settings.sleepReminders],
    ["Coach Messages", settings.coachMessages],
    ["Progress Updates", settings.progressUpdates],
    ["Delivery Policy", settings.globalDeliveryPolicy],
    ["Quiet Hours", settings.quietHoursEnabled ? `${settings.quietHoursStart} – ${settings.quietHoursEnd}` : "Off"],
  ];

  return (
    <AppCard variant="floating">
      <View style={styles.body}>
        <Text style={styles.title}>Notification Settings</Text>
        {entries.map(([label, value]) => (
          <View key={label} style={styles.row}>
            <Text style={styles.label}>{label}</Text>
            <Text style={styles.value}>{typeof value === "boolean" ? (value ? "On" : "Off") : value}</Text>
          </View>
        ))}
      </View>
    </AppCard>
  );
}
