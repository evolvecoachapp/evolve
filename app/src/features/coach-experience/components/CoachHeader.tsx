import { Pressable, StyleSheet, Text, View } from "react-native";
import { useTheme } from "../../../theme/ThemeContext";
import { spacing } from "../../../theme/theme";
import { useThemedStyles } from "../../../theme/useThemedStyles";
import { CoachAvatar } from "./CoachAvatar";

interface CoachHeaderProps {
  readonly title?: string;
  readonly subtitle?: string;
  readonly onHistoryPress?: () => void;
  readonly onSettingsPress?: () => void;
}

/** Coach experience header — presentation only. */
export function CoachHeader({
  title = "Coach",
  subtitle = "Contextual AI coaching",
  onHistoryPress,
  onSettingsPress,
}: CoachHeaderProps) {
  const { colors } = useTheme();
  const styles = useThemedStyles(({ typography }) =>
    StyleSheet.create({
      row: {
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.md,
        marginBottom: spacing.lg,
      },
      textCol: {
        flex: 1,
        gap: spacing.xs,
      },
      title: {
        ...typography.title2,
        color: colors.ink,
      },
      subtitle: {
        ...typography.caption,
        color: colors.inkSecondary,
      },
      actions: {
        flexDirection: "row",
        gap: spacing.sm,
      },
      action: {
        minHeight: spacing["3xl"],
        minWidth: spacing["3xl"],
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: spacing.sm,
      },
      actionLabel: {
        ...typography.caption,
        color: colors.pulse,
        fontWeight: "600",
      },
    }),
  );

  return (
    <View style={styles.row}>
      <CoachAvatar size="md" glow />
      <View style={styles.textCol}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
      <View style={styles.actions}>
        {onHistoryPress ? (
          <Pressable
            onPress={onHistoryPress}
            style={styles.action}
            accessibilityRole="button"
            accessibilityLabel="Coach history"
          >
            <Text style={styles.actionLabel}>History</Text>
          </Pressable>
        ) : null}
        {onSettingsPress ? (
          <Pressable
            onPress={onSettingsPress}
            style={styles.action}
            accessibilityRole="button"
            accessibilityLabel="Coach settings"
          >
            <Text style={styles.actionLabel}>Settings</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}
