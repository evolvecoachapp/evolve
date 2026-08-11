import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";
import { AppCard } from "../../../components/AppCard";
import { Chip } from "../../../components/Chip";
import { useTheme } from "../../../theme/ThemeContext";
import { radius, spacing } from "../../../theme/theme";
import { useThemedStyles } from "../../../theme/useThemedStyles";
import type { NotificationItem } from "../models";

export interface NotificationCardProps {
  readonly notification: NotificationItem;
  readonly onDismiss?: () => void;
  readonly onPress?: () => void;
}

const HIGH_PRIORITY: readonly string[] = ["high", "urgent"];

export function NotificationCard({ notification, onDismiss, onPress }: NotificationCardProps) {
  const { colors } = useTheme();
  const isUnread = !notification.readAt;
  const isHighPriority = HIGH_PRIORITY.includes(notification.priority);

  const styles = useThemedStyles(({ colors, typography }) => ({
    body: { gap: spacing.xs },
    header: { flexDirection: "row" as const, alignItems: "center" as const, gap: spacing.sm },
    iconRing: {
      width: spacing.avatar.sm,
      height: spacing.avatar.sm,
      borderRadius: radius.full,
      backgroundColor: colors.pulseMuted,
      alignItems: "center" as const,
      justifyContent: "center" as const,
    },
    titleRow: { flex: 1, flexDirection: "row" as const, alignItems: "center" as const, gap: spacing.xs },
    unreadDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.pulse,
    },
    title: { ...typography.callout, flex: 1, fontWeight: isUnread ? "700" : "500" },
    message: { ...typography.body, color: colors.inkMuted },
    meta: { ...typography.caption, color: colors.inkMuted },
    actions: { flexDirection: "row" as const, alignItems: "center" as const, gap: spacing.md, marginTop: spacing.xs },
    actionLabel: { ...typography.caption, color: colors.pulse, fontWeight: "600" },
    dismiss: { minHeight: spacing["2xl"], justifyContent: "center" as const, paddingHorizontal: spacing.xs },
    dismissLabel: { ...typography.caption, color: colors.inkMuted },
  }));

  return (
    <AppCard
      variant={isUnread ? "accent" : "floating"}
      onPress={onPress}
      accessibilityLabel={
        onPress
          ? `${notification.title}.${isHighPriority ? ` ${notification.priority} priority.` : ""} ${isUnread ? "Unread. Double tap to mark as read." : "Read."}`
          : undefined
      }
      accessibilityState={onPress ? { selected: !isUnread } : undefined}
    >
      <View style={styles.body}>
        <View style={styles.header}>
          <View style={styles.iconRing}>
            <Ionicons
              name={notification.icon as keyof typeof Ionicons.glyphMap}
              size={spacing.icon.sm}
              color={colors.pulse}
            />
          </View>
          <View style={styles.titleRow}>
            {isUnread ? <View style={styles.unreadDot} /> : null}
            <Text style={styles.title} numberOfLines={1}>
              {notification.title}
            </Text>
          </View>
          {isHighPriority ? (
            <Chip label={notification.priority} icon="alert-circle-outline" variant="warm" size="sm" />
          ) : null}
        </View>
        <Text style={styles.message}>{notification.message}</Text>
        <Text style={styles.meta}>
          {notification.category} · {notification.state}
        </Text>
        {notification.actions.length > 0 || onDismiss ? (
          <View style={styles.actions}>
            {notification.actions.map((action) => (
              <Text key={action.id} style={styles.actionLabel}>
                {action.label}
              </Text>
            ))}
            {onDismiss ? (
              <Pressable
                onPress={onDismiss}
                style={styles.dismiss}
                accessibilityRole="button"
                accessibilityLabel={`Dismiss ${notification.title}`}
                hitSlop={8}
              >
                <Text style={styles.dismissLabel}>Dismiss</Text>
              </Pressable>
            ) : null}
          </View>
        ) : null}
      </View>
    </AppCard>
  );
}
