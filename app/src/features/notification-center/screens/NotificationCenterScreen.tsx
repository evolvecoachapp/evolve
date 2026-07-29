import { RefreshControl, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GradientBackground } from "../../../components/GradientBackground";
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

export function NotificationCenterScreen({ service }: NotificationCenterScreenProps = {}) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const dashboard = useNotifications({ service });

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
                <>
                  <Text style={{ color: colors.inkMuted, fontSize: 13, marginTop: spacing.sm }}>Reminders</Text>
                  {dashboard.reminders.map((r) => (
                    <ReminderCard key={r.id} reminder={r} />
                  ))}
                </>
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
