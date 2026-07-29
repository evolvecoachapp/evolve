import { RefreshControl, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GradientBackground } from "../../../components/GradientBackground";
import { TabScreenContainer } from "../../../components/TabScreenContainer";
import { useTheme } from "../../../theme/ThemeContext";
import { spacing } from "../../../theme/theme";
import {
  AnalyticsChartCard,
  AnalyticsEmpty,
  AnalyticsError,
  AnalyticsFilterCard,
  AnalyticsHeader,
  AnalyticsSkeleton,
  BodyMeasurementsCard,
  GoalProgressCard,
  NutritionStatisticsCard,
  PersonalRecordsCard,
  ProgressSummaryCard,
  RecoveryStatisticsCard,
  StrengthProgressCard,
  WorkoutHistoryCard,
} from "../components";
import { useAnalytics } from "../hooks";
import type { ProgressAnalyticsService } from "../services";

export interface ProgressAnalyticsScreenProps {
  readonly service?: ProgressAnalyticsService;
}

export function ProgressAnalyticsScreen({ service }: ProgressAnalyticsScreenProps = {}) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const dashboard = useAnalytics({ service });

  const showContent =
    !dashboard.loading.isLoading &&
    !dashboard.error &&
    !dashboard.isEmpty;

  return (
    <GradientBackground variant="canvas">
      <TabScreenContainer
        gradient={false}
        withHeader={false}
        contentContainerStyle={{ paddingTop: insets.top + spacing.lg }}
        refreshControl={
          <RefreshControl
            refreshing={dashboard.loading.isRefreshing}
            onRefresh={() => void dashboard.refresh()}
            tintColor={colors.pulse}
            colors={[colors.pulse]}
          />
        }
      >
        <View style={{ gap: spacing.lg }}>
          {dashboard.loading.isLoading && !dashboard.summary ? <AnalyticsSkeleton /> : null}
          {dashboard.error && !dashboard.loading.isLoading ? (
            <AnalyticsError error={dashboard.error} onRetry={() => void dashboard.refresh()} />
          ) : null}
          {!dashboard.loading.isLoading && !dashboard.error && dashboard.isEmpty ? <AnalyticsEmpty /> : null}
          {showContent ? (
            <>
              {dashboard.summary ? <AnalyticsHeader summary={dashboard.summary} /> : null}
              {dashboard.filter ? <AnalyticsFilterCard filter={dashboard.filter} /> : null}
              {dashboard.summary ? <ProgressSummaryCard summary={dashboard.summary} /> : null}
              {dashboard.workoutHistory ? <WorkoutHistoryCard history={dashboard.workoutHistory} /> : null}
              {dashboard.strengthProgress ? <StrengthProgressCard progress={dashboard.strengthProgress} /> : null}
              <BodyMeasurementsCard
                measurements={dashboard.bodyMeasurements}
                composition={dashboard.bodyComposition}
                bodyWeight={dashboard.bodyWeightHistory}
              />
              {dashboard.nutritionStatistics ? (
                <NutritionStatisticsCard statistics={dashboard.nutritionStatistics} />
              ) : null}
              {dashboard.recoveryStatistics ? (
                <RecoveryStatisticsCard statistics={dashboard.recoveryStatistics} />
              ) : null}
              {dashboard.goalProgress.length > 0 ? <GoalProgressCard goals={dashboard.goalProgress} /> : null}
              {dashboard.personalRecords.length > 0 ? (
                <PersonalRecordsCard records={dashboard.personalRecords} />
              ) : null}
              {dashboard.charts.map((chart) => (
                <AnalyticsChartCard key={chart.id} chart={chart} />
              ))}
            </>
          ) : null}
        </View>
      </TabScreenContainer>
    </GradientBackground>
  );
}
