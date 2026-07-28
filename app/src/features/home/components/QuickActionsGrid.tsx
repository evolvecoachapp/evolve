import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { AppCard } from "../../../components/AppCard";
import { useTheme } from "../../../theme/ThemeContext";
import { spacing } from "../../../theme/theme";
import { useThemedStyles } from "../../../theme/useThemedStyles";
import type { QuickAction } from "../models/QuickAction";
import { DashboardSection } from "./DashboardSection";

interface QuickActionsGridProps {
  readonly actions: readonly QuickAction[];
  readonly onActionPress?: (action: QuickAction) => void;
}

/** Quick actions grid — presentation only; navigation wired by screen. */
export function QuickActionsGrid({
  actions,
  onActionPress,
}: QuickActionsGridProps) {
  const { colors } = useTheme();
  const styles = useThemedStyles(({ colors, typography, radius }) =>
    StyleSheet.create({
      grid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: spacing.md,
      },
      cell: {
        width: "47%",
        flexGrow: 1,
      },
      pressable: {
        opacity: 1,
      },
      pressableDisabled: {
        opacity: 0.45,
      },
      content: {
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.sm,
      },
      iconWrap: {
        width: spacing.avatar.md,
        height: spacing.avatar.md,
        borderRadius: radius.md,
        backgroundColor: colors.pulseMuted,
        alignItems: "center",
        justifyContent: "center",
      },
      label: {
        ...typography.callout,
        flex: 1,
        fontWeight: "600",
      },
    }),
  );

  if (actions.length === 0) {
    return null;
  }

  return (
    <DashboardSection title="Quick Actions">
      <View style={styles.grid}>
        {actions.map((action) => (
          <View key={action.id} style={styles.cell}>
            <Pressable
              disabled={!action.enabled}
              onPress={() => onActionPress?.(action)}
              style={
                action.enabled ? styles.pressable : styles.pressableDisabled
              }
              accessibilityRole="button"
              accessibilityState={{ disabled: !action.enabled }}
              accessibilityLabel={action.label}
            >
              <AppCard variant="elevated">
                <View style={styles.content}>
                  <View style={styles.iconWrap}>
                    <Ionicons
                      name={action.icon as keyof typeof Ionicons.glyphMap}
                      size={spacing.icon.md}
                      color={colors.pulse}
                    />
                  </View>
                  <Text style={styles.label}>{action.label}</Text>
                </View>
              </AppCard>
            </Pressable>
          </View>
        ))}
      </View>
    </DashboardSection>
  );
}
