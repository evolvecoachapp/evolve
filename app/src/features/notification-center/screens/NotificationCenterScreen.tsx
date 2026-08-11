import { RefreshControl, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../../../auth/useAuth";
import { GradientBackground } from "../../../components/GradientBackground";
import { SectionTitle } from "../../../components/SectionTitle";
import { TabScreenContainer } from "../../../components/TabScreenContainer";
import { useTheme } from "../../../theme/ThemeContext";
import { spacing } from "../../../theme/theme";
import {
  AddReminderRow,
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
import { buildPresetReminder } from "../models";
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

  const loaded = !dashboard.loading.isLoading && !dashboard.error;
  const hasInbox = dashboard.notifications.length > 0 || dashboard.coachNotifications.length > 0;
  const existingReminderTypes = new Set(dashboard.reminders.map((r) => r.type));

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
          {loaded ? (
            <>
              {dashboard.statistics ? <NotificationCenterHeader statistics={dashboard.statistics} /> : null}
              {hasInbox ? (
                <>
                  {dashboard.coachNotifications.map((cn) => (
                    <CoachNotificationCard key={cn.id} notification={cn} />
                  ))}
                  {dashboard.notifications.map((n) => (
                    <NotificationCard
                      key={n.id}
                      notification={n}
                      onPress={n.readAt ? undefined : () => void dashboard.markRead(n.id)}
                      onDismiss={() => void dashboard.dismiss(n.id)}
                    />
                  ))}
                </>
              ) : (
                <NotificationEmpty />
              )}
              <View style={{ gap: spacing.md }}>
                <SectionTitle title="Reminders" />
                <View style={{ gap: spacing.md }}>
                  {dashboard.reminders.map((r) => (
                    <ReminderCard
                      key={r.id}
                      reminder={r}
                      disabled={dashboard.saving.isSaving}
                      onToggleEnabled={() =>
                        void dashboard.editReminder({ ...r, enabled: !r.enabled })
                      }
                      onRemove={() => void dashboard.removeReminder(r.id)}
                    />
                  ))}
                </View>
                <AddReminderRow
                  existingTypes={existingReminderTypes}
                  disabled={dashboard.saving.isSaving}
                  onAdd={(type) =>
                    void dashboard.addReminder(buildPresetReminder(type, new Date().toISOString()))
                  }
                />
              </View>
              {dashboard.settings ? (
                <NotificationSettingsCard
                  settings={dashboard.settings}
                  saving={dashboard.saving.isSaving}
                  onToggle={(key, value) =>
                    void dashboard.updateSettings({ ...dashboard.settings!, [key]: value })
                  }
                />
              ) : null}
              {dashboard.statistics ? <NotificationStatisticsCard statistics={dashboard.statistics} /> : null}
            </>
          ) : null}
        </View>
      </TabScreenContainer>
    </GradientBackground>
  );
}
