import { Ionicons } from "@expo/vector-icons";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { AppCard } from "../../../components/AppCard";
import { useTheme } from "../../../theme/ThemeContext";
import { spacing } from "../../../theme/theme";
import { useThemedStyles } from "../../../theme/useThemedStyles";
import type { CoachQuickAction } from "../models/CoachQuickAction";

interface QuickActionsRowProps {
  readonly actions: readonly CoachQuickAction[];
  readonly onActionPress?: (action: CoachQuickAction) => void;
}

/** Horizontal quick actions — presentation only. */
export function QuickActionsRow({
  actions,
  onActionPress,
}: QuickActionsRowProps) {
  const { colors } = useTheme();
  const styles = useThemedStyles(({ typography, radius }) =>
    StyleSheet.create({
      sectionTitle: {
        ...typography.caption,
        color: colors.inkMuted,
        fontWeight: "700",
        textTransform: "uppercase",
        letterSpacing: 0.6,
        marginBottom: spacing.sm,
      },
      row: {
        gap: spacing.sm,
        paddingVertical: spacing.xs,
      },
      chip: {
        minHeight: spacing["3xl"] + spacing.sm,
        minWidth: 148,
        opacity: 1,
      },
      chipDisabled: {
        opacity: 0.45,
      },
      content: {
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.sm,
      },
      iconWrap: {
        width: spacing.avatar.sm,
        height: spacing.avatar.sm,
        borderRadius: radius.md,
        backgroundColor: colors.pulseMuted,
        alignItems: "center",
        justifyContent: "center",
      },
      label: {
        ...typography.callout,
        fontWeight: "600",
        color: colors.ink,
        maxWidth: 140,
      },
    }),
  );

  if (actions.length === 0) {
    return null;
  }

  return (
    <View>
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
      >
        {actions.map((action) => (
          <Pressable
            key={action.id}
            disabled={!action.enabled}
            onPress={() => onActionPress?.(action)}
            style={action.enabled ? styles.chip : styles.chipDisabled}
            accessibilityRole="button"
            accessibilityState={{ disabled: !action.enabled }}
            accessibilityLabel={action.label}
          >
            <AppCard variant="elevated" padding="compact">
              <View style={styles.content}>
                <View style={styles.iconWrap}>
                  <Ionicons
                    name={action.icon as keyof typeof Ionicons.glyphMap}
                    size={spacing.icon.sm}
                    color={colors.pulse}
                  />
                </View>
                <Text style={styles.label} numberOfLines={2}>
                  {action.label}
                </Text>
              </View>
            </AppCard>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}
