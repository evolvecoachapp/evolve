import { Text, View } from "react-native";
import { AppCard } from "../../../components/AppCard";
import { spacing } from "../../../theme/theme";
import { useThemedStyles } from "../../../theme/useThemedStyles";
import type { NotificationPreferences } from "../models";

export interface NotificationPreferencesCardProps {
  readonly prefs: NotificationPreferences;
}

function StatusDot({ enabled }: { readonly enabled: boolean }) {
  return (
    <View
      style={{
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: enabled ? "#34C759" : "#8E8E93",
        marginTop: 6,
      }}
    />
  );
}

export function NotificationPreferencesCard({ prefs }: NotificationPreferencesCardProps) {
  const styles = useThemedStyles(({ colors, typography }) => ({
    body: { gap: spacing.sm },
    title: { ...typography.title3 },
    item: { flexDirection: "row" as const, gap: spacing.sm, alignItems: "flex-start" as const },
    label: { ...typography.body },
  }));

  const items: { label: string; enabled: boolean }[] = [
    { label: "Workout reminders", enabled: prefs.workoutReminders },
    { label: "Meal reminders", enabled: prefs.mealReminders },
    { label: "Hydration reminders", enabled: prefs.hydrationReminders },
    { label: "Coach messages", enabled: prefs.coachMessages },
    { label: "Progress updates", enabled: prefs.progressUpdates },
  ];

  return (
    <AppCard variant="floating">
      <View style={styles.body}>
        <Text style={styles.title}>Notifications</Text>
        {items.map((it) => (
          <View key={it.label} style={styles.item}>
            <StatusDot enabled={it.enabled} />
            <Text style={styles.label}>{it.label}</Text>
          </View>
        ))}
      </View>
    </AppCard>
  );
}
