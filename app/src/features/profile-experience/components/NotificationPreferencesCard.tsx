import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";
import { AppCard } from "../../../components/AppCard";
import { useTheme } from "../../../theme/ThemeContext";
import { spacing } from "../../../theme/theme";
import { useThemedStyles } from "../../../theme/useThemedStyles";

export interface NotificationPreferencesCardProps {
  /** Navigates to the Notifications tab — the source of truth for reminder/alert settings. */
  readonly onPress?: () => void;
}

/**
 * Profile doesn't own reminder/alert settings — those live in Notification
 * Center. Rather than showing a second, possibly-stale copy of that state,
 * this links out to the tab that actually reads and saves it.
 */
export function NotificationPreferencesCard({ onPress }: NotificationPreferencesCardProps) {
  const { colors } = useTheme();
  const styles = useThemedStyles(({ colors, typography }) => ({
    row: { flexDirection: "row" as const, alignItems: "center" as const, gap: spacing.md },
    text: { flex: 1, gap: spacing.xs },
    title: { ...typography.title3 },
    value: { ...typography.callout, color: colors.inkMuted },
  }));

  return (
    <AppCard
      variant="floating"
      onPress={onPress}
      accessibilityLabel={
        onPress ? "Notifications. Manage reminders and alerts in the Notifications tab." : undefined
      }
    >
      <View style={styles.row}>
        <View style={styles.text}>
          <Text style={styles.title}>Notifications</Text>
          <Text style={styles.value}>Manage reminders and alerts in the Notifications tab</Text>
        </View>
        {onPress ? (
          <Ionicons name="chevron-forward" size={spacing.icon.md} color={colors.inkMuted} />
        ) : null}
      </View>
    </AppCard>
  );
}
