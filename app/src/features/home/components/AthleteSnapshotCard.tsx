import { StyleSheet, Text, View } from "react-native";
import { AppCard } from "../../../components/AppCard";
import { ChartPlaceholder } from "../../../components/ChartPlaceholder";
import { spacing } from "../../../theme/theme";
import { useThemedStyles } from "../../../theme/useThemedStyles";
import type { AthleteSnapshotCard as AthleteSnapshotCardModel } from "../models/AthleteSnapshotCard";
import { DashboardSection } from "./DashboardSection";

interface AthleteSnapshotCardProps {
  readonly athlete: AthleteSnapshotCardModel;
  readonly onDetails?: () => void;
  readonly index?: number;
}

/** Weekly progress snapshot card — presentation only. */
export function AthleteSnapshotCard({
  athlete,
  onDetails,
  index,
}: AthleteSnapshotCardProps) {
  const styles = useThemedStyles(({ colors, typography }) =>
    StyleSheet.create({
      chartSpacing: {
        marginBottom: spacing.lg,
      },
      weeklyStats: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-around",
      },
      weeklyStat: {
        alignItems: "center",
        gap: spacing.xs,
        flex: 1,
      },
      statDivider: {
        width: 1,
        height: spacing.statDividerHeight,
        backgroundColor: colors.border,
      },
      weeklyStatValue: {
        ...typography.title3,
      },
      weeklyStatLabel: {
        ...typography.caption,
        color: colors.inkMuted,
      },
    }),
  );

  if (!athlete.present) {
    return null;
  }

  return (
    <DashboardSection
      title="Weekly Progress"
      actionLabel="Details"
      onAction={onDetails}
      index={index}
    >
      <AppCard variant="elevated">
        <ChartPlaceholder
          icon="bar-chart-outline"
          height={spacing.chart.sm}
          style={styles.chartSpacing}
        />
        <View style={styles.weeklyStats}>
          <View style={styles.weeklyStat}>
            <Text style={styles.weeklyStatValue}>
              {athlete.workoutsCompleted}/{athlete.workoutsTarget}
            </Text>
            <Text style={styles.weeklyStatLabel}>Workouts</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.weeklyStat}>
            <Text style={styles.weeklyStatValue}>{athlete.avgCalories}</Text>
            <Text style={styles.weeklyStatLabel}>Avg kcal</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.weeklyStat}>
            <Text style={styles.weeklyStatValue}>{athlete.streakDays}</Text>
            <Text style={styles.weeklyStatLabel}>Day streak</Text>
          </View>
        </View>
      </AppCard>
    </DashboardSection>
  );
}
