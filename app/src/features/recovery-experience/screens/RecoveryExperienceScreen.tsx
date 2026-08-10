import { RefreshControl, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../../../auth/useAuth";
import { GradientBackground } from "../../../components/GradientBackground";
import { TabScreenContainer } from "../../../components/TabScreenContainer";
import { useTheme } from "../../../theme/ThemeContext";
import { spacing } from "../../../theme/theme";
import {
  ReadinessCard,
  RecoveryDaySelector,
  RecoveryEmpty,
  RecoveryError,
  RecoveryHeader,
  RecoverySignalsCard,
  RecoverySkeleton,
  RecoverySummaryCard,
  SleepCard,
} from "../components";
import { useRecoveryDashboard } from "../hooks";
import type { RecoveryExperienceService } from "../services";

export interface RecoveryExperienceScreenProps {
  readonly service?: RecoveryExperienceService;
}

/**
 * Operational Recovery Experience screen — composition only.
 * Production data flows from hydrated Unified Workspace via applyHydratedRecovery().
 * RecoveryExperienceService is test/preview-only when injected via the service prop.
 */
export function RecoveryExperienceScreen({ service }: RecoveryExperienceScreenProps = {}) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { user } = useAuth();
  const dashboard = useRecoveryDashboard({ service, athleteId: user?.id });

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
          {dashboard.loading.isLoading && !dashboard.dashboard ? <RecoverySkeleton /> : null}
          {dashboard.error && !dashboard.loading.isLoading ? (
            <RecoveryError error={dashboard.error} onRetry={() => void dashboard.refresh()} />
          ) : null}
          {!dashboard.loading.isLoading && !dashboard.error && dashboard.isEmpty ? (
            <RecoveryEmpty />
          ) : null}
          {showContent ? (
            <>
              <RecoveryHeader dashboard={dashboard.dashboard!} />
              <RecoveryDaySelector
                value={dashboard.day}
                options={dashboard.availableDays}
                onChange={(day) => void dashboard.changeDay(day)}
              />
              <RecoverySummaryCard dashboard={dashboard.dashboard!} />
              <SleepCard
                sleep={dashboard.dashboard!.sleep}
                onLogSleep={(hours) => void dashboard.logSleep(hours)}
              />
              <ReadinessCard
                readiness={dashboard.dashboard!.readiness}
                onUpdateReadiness={(score) => void dashboard.updateReadiness(score)}
              />
              <RecoverySignalsCard
                signals={dashboard.dashboard!.signals}
                assessmentAvailable={dashboard.dashboard!.assessmentAvailable}
                onAssess={() => void dashboard.assessRecovery()}
              />
            </>
          ) : null}
        </View>
      </TabScreenContainer>
    </GradientBackground>
  );
}
