import { RefreshControl, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../../../auth/useAuth";
import { GradientBackground } from "../../../components/GradientBackground";
import { TabScreenContainer } from "../../../components/TabScreenContainer";
import { isReachableRoute } from "../../../navigation/isReachableRoute";
import { useTheme } from "../../../theme/ThemeContext";
import { spacing } from "../../../theme/theme";
import { useThemedStyles } from "../../../theme/useThemedStyles";
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
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, preference: livePreference } = useTheme();
  const dashboard = useProfile({
    service,
    athleteId: user?.id,
    backendUser: user,
  });

  const styles = useThemedStyles(({ colors, typography }) => ({
    footer: { gap: spacing.xs, paddingVertical: spacing.md },
    footerText: { ...typography.caption, color: colors.inkMuted, textAlign: "center" as const },
    footerMeta: { ...typography.micro, color: colors.inkMuted, textAlign: "center" as const },
  }));

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
          {!dashboard.loading.isLoading && !dashboard.error && dashboard.isEmpty ? (
            <ProfileEmpty
              onCompleteSetup={
                isReachableRoute("/(app)/setup")
                  ? () => router.push("/(app)/setup" as never)
                  : undefined
              }
            />
          ) : null}
          {showContent ? (
            <>
              <ProfileHeader profile={dashboard.profile!} />
              <AthleteCard profile={dashboard.profile!} />
              <GoalsCard
                goals={dashboard.profile!.goals}
                onPress={isReachableRoute("/(app)/goals") ? () => router.push("/(app)/goals" as never) : undefined}
              />
              <TrainingPreferencesCard prefs={dashboard.profile!.trainingPreferences} />
              <NutritionPreferencesCard prefs={dashboard.profile!.nutritionPreferences} />
              <CoachPreferencesCard prefs={dashboard.profile!.coachPreferences} />
              <NotificationPreferencesCard
                onPress={
                  isReachableRoute("/(app)/notifications")
                    ? () => router.push("/(app)/notifications" as never)
                    : undefined
                }
              />
              <AppearanceCard
                // Athlete Identity's stored appearance setting isn't wired to the
                // live theme switch in Settings, so show the actual active
                // preference here instead of a possibly-stale identity field.
                prefs={{ ...dashboard.profile!.appearancePreferences, theme: livePreference }}
                onPress={() => router.push("/(app)/settings/appearance")}
              />
              <MeasurementUnitsCard units={dashboard.profile!.measurementUnits} />
              <ConnectedServicesCard connectedServices={dashboard.profile!.connectedServices} />
              <View style={styles.footer}>
                <Text style={styles.footerText}>
                  EVOLVE v{dashboard.profile!.appVersion}
                </Text>
                <Text style={styles.footerMeta}>
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
