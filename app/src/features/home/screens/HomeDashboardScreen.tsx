import { useMemo } from "react";
import { RefreshControl } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GradientBackground } from "../../../components/GradientBackground";
import { TabScreenContainer } from "../../../components/TabScreenContainer";
import { RecommendationWidget } from "../../recommendations/components";
import { useAuth } from "../../../auth/useAuth";
import { useTheme } from "../../../theme/ThemeContext";
import { spacing } from "../../../theme/theme";
import {
  AthleteSnapshotCard,
  CoachCard,
  DashboardSection,
  EmptyDashboard,
  ErrorDashboard,
  HomeDashboardHeader,
  NutritionCard,
  QuickActionsGrid,
  RecoveryCard,
  SkeletonDashboard,
  WorkoutCard,
} from "../components";
import { useHomeDashboard, usePullToRefresh } from "../hooks";
import { mapAthleteInitials } from "../mappers";
import type { QuickAction } from "../models/QuickAction";
import type { HomeService } from "../services";

export interface HomeDashboardScreenProps {
  readonly service?: HomeService;
}

/**
 * Operational Home dashboard screen — composition only.
 * Production data flows from Dashboard Restore via applyRestoredDashboard().
 * HomeService is test/preview-only when injected via the service prop.
 */
export function HomeDashboardScreen({
  service,
}: HomeDashboardScreenProps = {}) {
  const { user } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  const identity = useMemo(() => {
    const displayName =
      user?.first_name?.trim() ||
      user?.username?.trim() ||
      "Athlete";
    return Object.freeze({
      displayName,
      initials: mapAthleteInitials(displayName),
    });
  }, [user?.first_name, user?.username]);

  const {
    dashboard,
    athlete,
    workout,
    nutrition,
    recovery,
    coach,
    quickActions,
    loading,
    error,
    isEmpty,
    refresh,
  } = useHomeDashboard({ service, identity });

  const pull = usePullToRefresh({
    onRefresh: refresh,
    refreshing: loading.isRefreshing,
  });

  const navigate = (destination: string) => {
    router.push(destination as never);
  };

  const handleQuickAction = (action: QuickAction) => {
    if (!action.enabled) {
      return;
    }
    navigate(action.destination);
  };

  return (
    <GradientBackground variant="canvas">
      <TabScreenContainer
        gradient={false}
        withHeader={false}
        contentContainerStyle={{ paddingTop: insets.top + spacing.lg }}
        refreshControl={
          <RefreshControl
            refreshing={pull.refreshing}
            onRefresh={pull.onRefresh}
            tintColor={colors.pulse}
            colors={[colors.pulse]}
          />
        }
      >
        {loading.isLoading && !dashboard ? <SkeletonDashboard /> : null}

        {error && !loading.isLoading ? (
          <ErrorDashboard error={error} onRetry={() => void refresh()} />
        ) : null}

        {!loading.isLoading && !error && isEmpty ? <EmptyDashboard /> : null}

        {!loading.isLoading && !error && dashboard && athlete && !isEmpty ? (
          <>
            <HomeDashboardHeader
              athlete={athlete}
              onNotificationsPress={() => navigate("/(app)/notifications")}
            />

            {workout ? (
              <WorkoutCard
                workout={workout}
                onPress={() => navigate(workout.destination)}
                onView={() => navigate(workout.destination)}
                index={1}
              />
            ) : null}

            {nutrition ? (
              <NutritionCard
                nutrition={nutrition}
                onSeeAll={() => navigate(nutrition.destination)}
                index={2}
              />
            ) : null}

            {recovery ? <RecoveryCard recovery={recovery} index={3} /> : null}

            <AthleteSnapshotCard
              athlete={athlete}
              onDetails={() => navigate("/(app)/(tabs)/progress")}
              index={4}
            />

            {coach ? (
              <CoachCard
                coach={coach}
                onPress={() => navigate(coach.destination)}
                index={5}
              />
            ) : null}

            <QuickActionsGrid
              actions={quickActions}
              onActionPress={handleQuickAction}
              index={6}
            />

            <DashboardSection title="Today's Intelligence" index={7}>
              <RecommendationWidget />
            </DashboardSection>
          </>
        ) : null}
      </TabScreenContainer>
    </GradientBackground>
  );
}
