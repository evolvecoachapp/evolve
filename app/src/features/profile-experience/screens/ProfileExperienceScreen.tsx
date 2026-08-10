import { RefreshControl, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../../../auth/useAuth";
import { GradientBackground } from "../../../components/GradientBackground";
import { TabScreenContainer } from "../../../components/TabScreenContainer";
import { useTheme } from "../../../theme/ThemeContext";
import { spacing } from "../../../theme/theme";
import {
  AppearanceCard,
  AthleteCard,
  CoachPreferencesCard,
  ConnectedServicesCard,
  GoalsCard,
  MeasurementUnitsCard,
  NotificationPreferencesCard,
  NutritionPreferencesCard,
  ProfileEmpty,
  ProfileError,
  ProfileHeader,
  ProfileSkeleton,
  TrainingPreferencesCard,
} from "../components";
import { useProfile } from "../hooks";
import type { ProfileExperienceService } from "../services";

export interface ProfileExperienceScreenProps {
  readonly service?: ProfileExperienceService;
}

/**
 * Digital Athlete Profile screen — composition only.
 * Production data flows from hydrated Athlete Identity via applyHydratedProfile().
 * ProfileExperienceService is test/preview-only when injected via the service prop.
 */
export function ProfileExperienceScreen({ service }: ProfileExperienceScreenProps = {}) {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const dashboard = useProfile({
    service,
    athleteId: user?.id,
  });

  const showContent =
    !dashboard.loading.isLoading &&
    !dashboard.error &&
    dashboard.profile &&
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
          {dashboard.loading.isLoading && !dashboard.profile ? <ProfileSkeleton /> : null}
          {dashboard.error && !dashboard.loading.isLoading ? (
            <ProfileError error={dashboard.error} onRetry={() => void dashboard.refresh()} />
          ) : null}
          {!dashboard.loading.isLoading && !dashboard.error && dashboard.isEmpty ? <ProfileEmpty /> : null}
          {showContent ? (
            <>
              <ProfileHeader profile={dashboard.profile!} />
              <AthleteCard profile={dashboard.profile!} />
              <GoalsCard goals={dashboard.profile!.goals} />
              <TrainingPreferencesCard prefs={dashboard.profile!.trainingPreferences} />
              <NutritionPreferencesCard prefs={dashboard.profile!.nutritionPreferences} />
              <CoachPreferencesCard prefs={dashboard.profile!.coachPreferences} />
              <NotificationPreferencesCard prefs={dashboard.profile!.notificationPreferences} />
              <AppearanceCard prefs={dashboard.profile!.appearancePreferences} />
              <MeasurementUnitsCard units={dashboard.profile!.measurementUnits} />
              <ConnectedServicesCard connectedServices={dashboard.profile!.connectedServices} />
              <View style={{ gap: spacing.xs, paddingVertical: spacing.md }}>
                <Text style={{ color: colors.inkMuted, fontSize: 13, textAlign: "center" }}>
                  EVOLVE v{dashboard.profile!.appVersion}
                </Text>
                <Text style={{ color: colors.inkMuted, fontSize: 12, textAlign: "center" }}>
                  Account: {dashboard.profile!.accountStatus}
                </Text>
              </View>
            </>
          ) : null}
        </View>
      </TabScreenContainer>
    </GradientBackground>
  );
}
