import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";
import { AppCard } from "../../../components/AppCard";
import { ProgressBar } from "../../../components/ProgressBar";
import { useTheme } from "../../../theme/ThemeContext";
import { spacing } from "../../../theme/theme";
import { useThemedStyles } from "../../../theme/useThemedStyles";
import type { AthleteGoal } from "../models";

export interface GoalsCardProps {
  readonly goals: readonly AthleteGoal[];
  /** Navigates to the Goals tab — the source of truth for goal progress/editing. */
  readonly onPress?: () => void;
}

export function GoalsCard({ goals, onPress }: GoalsCardProps) {
  const { colors } = useTheme();
  const styles = useThemedStyles(({ colors, typography }) => ({
    body: { gap: spacing.md },
    header: { flexDirection: "row" as const, alignItems: "center" as const, justifyContent: "space-between" as const },
    title: { ...typography.title3 },
    goalItem: { gap: spacing.xs },
    goalTitle: { ...typography.callout },
    goalDesc: { ...typography.caption, color: colors.inkMuted },
    primary: { ...typography.caption, color: colors.pulse },
    empty: { ...typography.callout, color: colors.inkMuted },
    link: { ...typography.caption, color: colors.pulse, fontWeight: "600" as const },
  }));

  return (
    <AppCard variant="floating" onPress={onPress}>
      <View style={styles.body}>
        <View style={styles.header}>
          <Text style={styles.title}>Goals</Text>
          {onPress ? <Ionicons name="chevron-forward" size={spacing.icon.sm} color={colors.inkMuted} /> : null}
        </View>
        {goals.length === 0 ? (
          <Text style={styles.empty}>
            No goals to show here yet. {onPress ? <Text style={styles.link}>Open the Goals tab</Text> : "Visit the Goals tab"} to set and track them.
          </Text>
        ) : (
          goals.map((goal) => (
            <View key={goal.id} style={styles.goalItem}>
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text style={styles.goalTitle}>{goal.title}</Text>
                {goal.isPrimary ? <Text style={styles.primary}>Primary</Text> : null}
              </View>
              <Text style={styles.goalDesc}>{goal.description}</Text>
              <ProgressBar progress={goal.progress} />
            </View>
          ))
        )}
      </View>
    </AppCard>
  );
}
