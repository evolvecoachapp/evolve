import { Text, View } from "react-native";
import { AppCard } from "../../../components/AppCard";
import { Chip } from "../../../components/Chip";
import { spacing } from "../../../theme/theme";
import { useThemedStyles } from "../../../theme/useThemedStyles";
import type { NotificationSettings } from "../models";

type ToggleableSettingKey =
  | "workoutReminders"
  | "nutritionReminders"
  | "hydrationReminders"
  | "recoveryReminders"
  | "sleepReminders"
  | "coachMessages"
  | "progressUpdates";

export interface NotificationSettingsCardProps {
  readonly settings: NotificationSettings;
  /** Toggles a single boolean preference — omitted while settings are read-only. */
  readonly onToggle?: (key: ToggleableSettingKey, value: boolean) => void;
  readonly saving?: boolean;
}

const TOGGLE_ROWS: readonly [ToggleableSettingKey, string][] = [
  ["workoutReminders", "Workout Reminders"],
  ["nutritionReminders", "Nutrition Reminders"],
  ["hydrationReminders", "Hydration Reminders"],
  ["recoveryReminders", "Recovery Reminders"],
  ["sleepReminders", "Sleep Reminders"],
  ["coachMessages", "Coach Messages"],
  ["progressUpdates", "Progress Updates"],
];

export function NotificationSettingsCard({
  settings,
  onToggle,
  saving = false,
}: NotificationSettingsCardProps) {
  const styles = useThemedStyles(({ colors, typography }) => ({
    body: { gap: spacing.sm },
    title: { ...typography.title3 },
    row: {
      flexDirection: "row" as const,
      alignItems: "center" as const,
      justifyContent: "space-between" as const,
    },
    label: { ...typography.callout },
    value: { ...typography.callout, color: colors.inkMuted },
  }));

  const readOnlyEntries: readonly [string, string][] = [
    ["Delivery Policy", settings.globalDeliveryPolicy],
    [
      "Quiet Hours",
      settings.quietHoursEnabled
        ? `${settings.quietHoursStart} – ${settings.quietHoursEnd}`
        : "Off",
    ],
  ];

  return (
    <AppCard variant="floating">
      <View style={styles.body}>
        <Text style={styles.title}>Notification Settings</Text>
        {TOGGLE_ROWS.map(([key, label]) => {
          const value = settings[key];
          return (
            <View key={key} style={styles.row}>
              <Text style={styles.label}>{label}</Text>
              {onToggle ? (
                <Chip
                  label={value ? "On" : "Off"}
                  accessibilityLabel={`${label}: ${value ? "On" : "Off"}`}
                  variant={value ? "selected" : "outline"}
                  size="sm"
                  disabled={saving}
                  onPress={() => onToggle(key, !value)}
                />
              ) : (
                <Text style={styles.value}>{value ? "On" : "Off"}</Text>
              )}
            </View>
          );
        })}
        {readOnlyEntries.map(([label, value]) => (
          <View key={label} style={styles.row}>
            <Text style={styles.label}>{label}</Text>
            <Text style={styles.value}>{value}</Text>
          </View>
        ))}
      </View>
    </AppCard>
  );
}
