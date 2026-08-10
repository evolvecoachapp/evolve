import { RefreshControl, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../../../auth/useAuth";
import { GradientBackground } from "../../../components/GradientBackground";
import { TabScreenContainer } from "../../../components/TabScreenContainer";
import { useTheme } from "../../../theme/ThemeContext";
import { spacing } from "../../../theme/theme";
import {
  GoalMilestonesCard,
  GoalProgressEmpty,
  GoalProgressError,
  GoalProgressHeader,
  GoalProgressSkeleton,
  GoalProgressSummaryCard,
} from "../components";
import { useGoalProgressDashboard } from "../hooks";
import type { GoalProgressExperienceService } from "../services";

export interface GoalProgressExperienceScreenProps {
  readonly service?: GoalProgressExperienceService;
}

/**
 * Operational Goal Progress Experience screen — composition only.
 * Production data flows from hydrated Unified Workspace via applyHydratedGoalProgress().
 * GoalProgressExperienceService is test/preview-only when injected via the service prop.
 */
export function GoalProgressExperienceScreen({
  service,
}: GoalProgressExperienceScreenProps = {}) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { user } = useAuth();
  const dashboard = useGoalProgressDashboard({ service, athleteId: user?.id });

  const showContent =
    !dashboard.loading.isLoading &&
    !dashboard.error &&
    dashboard.dashboard &&
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
          {dashboard.loading.isLoading && !dashboard.dashboard ? (
            <GoalProgressSkeleton />
          ) : null}
          {dashboard.error && !dashboard.loading.isLoading ? (
            <GoalProgressError
              error={dashboard.error}
              onRetry={() => void dashboard.refresh()}
            />
          ) : null}
          {!dashboard.loading.isLoading && !dashboard.error && dashboard.isEmpty ? (
            <GoalProgressEmpty />
          ) : null}
          {showContent ? (
            <>
              <GoalProgressHeader dashboard={dashboard.dashboard!} />
              <GoalProgressSummaryCard
                dashboard={dashboard.dashboard!}
                onUpdateProgress={() => void dashboard.updateProgress()}
                onCompleteGoal={() => void dashboard.completeGoal()}
              />
              <GoalMilestonesCard
                milestones={dashboard.dashboard!.milestones}
                onCompleteMilestone={(milestoneId) =>
                  void dashboard.completeMilestone(milestoneId)
                }
              />
            </>
          ) : null}
        </View>
      </TabScreenContainer>
    </GradientBackground>
  );
}
