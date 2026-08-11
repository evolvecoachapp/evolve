import { RefreshControl, View } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../../../auth/useAuth";
import { GradientBackground } from "../../../components/GradientBackground";
import { TabScreenContainer } from "../../../components/TabScreenContainer";
import { isReachableRoute } from "../../../navigation/isReachableRoute";
import { useTheme } from "../../../theme/ThemeContext";
import { spacing } from "../../../theme/theme";
import {
  AnalyticsGrid,
  BodyMetricsCard,
  CoachInsightsCard,
  GoalProgressCard,
  NutritionChartCard,
  PersonalRecordsCard,
  ProgressEmpty,
  ProgressError,
  ProgressHeader,
  ProgressSkeleton,
  RecoveryChartCard,
  StrengthChartCard,
  TimeRangeSelector,
  TrainingStreakCard,
  VolumeChartCard,
} from "../components";
import { useCoachInsights, useProgressDashboard, useTimeRange } from "../hooks";
import type { ProgressExperienceService } from "../services";

export interface ProgressExperienceScreenProps { readonly service?: ProgressExperienceService; }

export function ProgressExperienceScreen({ service }: ProgressExperienceScreenProps = {}) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { user } = useAuth();
  const dashboard = useProgressDashboard({ service, athleteId: user?.id });
  const timeRange = useTimeRange({ viewModel: dashboard.viewModel });
  const insights = useCoachInsights({ viewModel: dashboard.viewModel });

  const navigatePlaceholder = (destination: string | null | undefined) => {
    if (!destination || !isReachableRoute(destination)) return;
    router.push(destination as never);
  };

  const reachableHandler = (destination: string | null | undefined) =>
    isReachableRoute(destination) ? () => navigatePlaceholder(destination) : undefined;

  const showContent = !dashboard.loading.isLoading && !dashboard.error && dashboard.dashboard && !dashboard.isEmpty;

  return (
    <GradientBackground variant="canvas">
      <TabScreenContainer
        gradient={false}
        withHeader={false}
        contentContainerStyle={{ paddingTop: insets.top + spacing.lg }}
        refreshControl={<RefreshControl refreshing={dashboard.loading.isRefreshing} onRefresh={() => void dashboard.refresh()} tintColor={colors.pulse} colors={[colors.pulse]} />}
      >
        <View style={{ gap: spacing.lg }}>
          {dashboard.loading.isLoading && !dashboard.dashboard ? <ProgressSkeleton /> : null}
          {dashboard.error && !dashboard.loading.isLoading ? <ProgressError error={dashboard.error} onRetry={() => void dashboard.refresh()} /> : null}
          {!dashboard.loading.isLoading && !dashboard.error && dashboard.isEmpty ? <ProgressEmpty /> : null}
          {showContent ? (
            <>
              <ProgressHeader dashboard={dashboard.dashboard!} />
              <TimeRangeSelector value={timeRange.timeRange} options={timeRange.options} onChange={(next) => void timeRange.changeRange(next)} />
              <AnalyticsGrid>
                <StrengthChartCard progress={dashboard.dashboard!.strength} onPress={reachableHandler(dashboard.dashboard!.strength.destination)} />
                <VolumeChartCard progress={dashboard.dashboard!.volume} onPress={reachableHandler(dashboard.dashboard!.volume.destination)} />
                <RecoveryChartCard progress={dashboard.dashboard!.recovery} onPress={reachableHandler(dashboard.dashboard!.recovery.destination)} />
                <NutritionChartCard progress={dashboard.dashboard!.nutrition} onPress={reachableHandler(dashboard.dashboard!.nutrition.destination)} />
                <BodyMetricsCard bodyMetrics={dashboard.dashboard!.bodyMetrics} onPress={reachableHandler(dashboard.dashboard!.bodyMetrics.destination)} />
                <GoalProgressCard goal={dashboard.dashboard!.goalProgress} onPress={reachableHandler(dashboard.dashboard!.goalProgress.destination)} />
                <TrainingStreakCard streak={dashboard.dashboard!.trainingStreak} onPress={reachableHandler(dashboard.dashboard!.trainingStreak.destination)} />
                <PersonalRecordsCard records={dashboard.dashboard!.personalRecords} />
                <CoachInsightsCard insights={insights.insights} />
              </AnalyticsGrid>
            </>
          ) : null}
        </View>
      </TabScreenContainer>
    </GradientBackground>
  );
}
