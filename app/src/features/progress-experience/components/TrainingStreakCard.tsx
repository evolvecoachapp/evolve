import { Text, View } from "react-native";
import { AppCard } from "../../../components/AppCard";
import { spacing } from "../../../theme/theme";
import { useThemedStyles } from "../../../theme/useThemedStyles";
import type { TrainingStreak } from "../models";

export interface TrainingStreakCardProps { readonly streak: TrainingStreak; readonly onPress?: () => void; }

export function TrainingStreakCard({ streak, onPress }: TrainingStreakCardProps) {
  const styles = useThemedStyles(({ colors, typography }) => ({ row: { flexDirection: "row" as const, gap: spacing.lg }, title: { ...typography.title3 }, metric: { ...typography.metricCompact }, supporting: { ...typography.callout, color: colors.inkMuted } }));
  return (
    <AppCard variant="floating" onPress={onPress}>
      <Text style={styles.title}>Training Streak</Text>
      <View style={styles.row}>
        <View>
          <Text style={styles.metric}>{streak.currentDays}</Text>
          <Text style={styles.supporting}>Current days</Text>
        </View>
        <View>
          <Text style={styles.metric}>{streak.bestDays}</Text>
          <Text style={styles.supporting}>Best streak</Text>
        </View>
      </View>
    </AppCard>
  );
}
