import { Pressable, Text, View } from "react-native";
import { AppCard } from "../../../components/AppCard";
import { spacing } from "../../../theme/theme";
import { useThemedStyles } from "../../../theme/useThemedStyles";
import type { GoalMilestoneItem } from "../models";

export interface GoalMilestonesCardProps {
  readonly milestones: readonly GoalMilestoneItem[];
  readonly onCompleteMilestone?: (milestoneId: string) => void;
}

export function GoalMilestonesCard({
  milestones,
  onCompleteMilestone,
}: GoalMilestonesCardProps) {
  const styles = useThemedStyles(({ colors, typography }) => ({
    body: { gap: spacing.md },
    title: { ...typography.title3 },
    item: { gap: spacing.xs },
    label: { ...typography.callout },
    meta: { ...typography.caption, color: colors.inkMuted },
    action: { ...typography.caption, color: colors.pulse },
  }));

  if (milestones.length === 0) {
    return null;
  }

  return (
    <AppCard variant="floating">
      <View style={styles.body}>
        <Text style={styles.title}>Milestones</Text>
        {milestones.map((milestone) => (
          <View key={milestone.id} style={styles.item}>
            <Text style={styles.label}>{milestone.label}</Text>
            <Text style={styles.meta}>
              {milestone.category} · {milestone.reached ? "Reached" : "Pending"}
            </Text>
            {!milestone.reached && onCompleteMilestone ? (
              <Pressable
                onPress={() => onCompleteMilestone(milestone.id)}
                accessibilityRole="button"
                accessibilityLabel={`Mark ${milestone.label} reached`}
                hitSlop={8}
              >
                <Text style={styles.action}>Mark reached</Text>
              </Pressable>
            ) : null}
          </View>
        ))}
      </View>
    </AppCard>
  );
}
