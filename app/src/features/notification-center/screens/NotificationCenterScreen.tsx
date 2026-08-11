import { RefreshControl, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../../../auth/useAuth";
import { GradientBackground } from "../../../components/GradientBackground";
import { SectionTitle } from "../../../components/SectionTitle";
import { TabScreenContainer } from "../../../components/TabScreenContainer";
import { useTheme } from "../../../theme/ThemeContext";
import { spacing } from "../../../theme/theme";
import {
  CoachNotificationCard,
  NotificationCard,
  NotificationCenterHeader,
  NotificationEmpty,
  NotificationError,
  NotificationSettingsCard,
  NotificationSkeleton,
  NotificationStatisticsCard,
  ReminderCard,
} from "../components";
import { useNotifications } from "../hooks";
import type { NotificationCenterService } from "../services";

export interface NotificationCenterScreenProps {
  readonly service?: NotificationCenterService;
}

/**
 * Notification Center screen — composition only.
 * Production data flows from hydrated Unified Workspace via applyHydratedNotifications().
 * NotificationCenterService is test/preview-only when injected via the service prop.
 */
export function NotificationCenterScreen({ service }: NotificationCenterScreenProps = {}) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { user } = useAuth();
  const dashboard = useNotifications({ service, athleteId: user?.id });

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
          {dashboard.loading.isLoading && dashboard.notifications.length === 0 ? <NotificationSkeleton /> : null}
          {dashboard.error && !dashboard.loading.isLoading ? (
            <NotificationError error={dashboard.error} onRetry={() => void dashboard.refresh()} />
          ) : null}
          {!dashboard.loading.isLoading && !dashboard.error && dashboard.isEmpty ? <NotificationEmpty /> : null}
          {showContent ? (
            <>
              {dashboard.statistics ? <NotificationCenterHeader statistics={dashboard.statistics} /> : null}
              {dashboard.coachNotifications.map((cn) => (
                <CoachNotificationCard key={cn.id} notification={cn} />
              ))}
              {dashboard.notifications.map((n) => (
                <NotificationCard
                  key={n.id}
                  notification={n}
                  onDismiss={() => void dashboard.dismiss(n.id)}
                />
              ))}
              {dashboard.reminders.length > 0 ? (
                <View>
                  <SectionTitle title="Reminders" />
                  <View style={{ gap: spacing.md }}>
                    {dashboard.reminders.map((r) => (
                      <ReminderCard key={r.id} reminder={r} />
                    ))}
                  </View>
                </View>
              ) : null}
              {dashboard.settings ? <NotificationSettingsCard settings={dashboard.settings} /> : null}
              {dashboard.statistics ? <NotificationStatisticsCard statistics={dashboard.statistics} /> : null}
            </>
          ) : null}
        </View>
      </TabScreenContainer>
    </GradientBackground>
  );
}
