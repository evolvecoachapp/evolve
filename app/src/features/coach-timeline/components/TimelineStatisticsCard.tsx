import { Text, View } from "react-native";
import { AppCard } from "../../../components/AppCard";
import { spacing } from "../../../theme/theme";
import { useThemedStyles } from "../../../theme/useThemedStyles";
import type { TimelineStatistics } from "../models";

export interface TimelineStatisticsCardProps {
  readonly statistics: TimelineStatistics;
}

export function TimelineStatisticsCard({ statistics }: TimelineStatisticsCardProps) {
  const styles = useThemedStyles(({ colors, typography }) => ({
    body: { gap: spacing.xs },
    title: { ...typography.callout },
    row: { ...typography.body, color: colors.inkMuted },
  }));

  return (
    <AppCard variant="glass">
      <View style={styles.body}>
        <Text style={styles.title}>Timeline Statistics</Text>
        <Text style={styles.row}>Total: {statistics.totalEvents}</Text>
        <Text style={styles.row}>This week: {statistics.eventsThisWeek}</Text>
        <Text style={styles.row}>Nutrition: {statistics.nutritionEvents}</Text>
        <Text style={styles.row}>Recovery: {statistics.recoveryEvents}</Text>
        <Text style={styles.row}>Coach: {statistics.coachEvents}</Text>
        <Text style={styles.row}>Achievements: {statistics.achievementEvents}</Text>
      </View>
    </AppCard>
  );
}
