import { router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { AppButton } from "../components/AppButton";
import { AppCard } from "../components/AppCard";
import { AppHeader } from "../components/AppHeader";
import { Avatar } from "../components/Avatar";
import { Chip } from "../components/Chip";
import { GradientBackground } from "../components/GradientBackground";
import { TabScreenContainer } from "../components/TabScreenContainer";
import { SectionTitle } from "../components/SectionTitle";
import { useAuth } from "../auth/useAuth";
import { profileMock } from "../data/mocks/profile";
import { SettingsRow } from "../features/profile/components";
import { spacing } from "../theme/theme";
import { useThemedStyles } from "../theme/useThemedStyles";

function getInitials(firstName?: string | null, username?: string): string {
  if (firstName) {
    return firstName.charAt(0).toUpperCase();
  }
  if (username) {
    return username.charAt(0).toUpperCase();
  }
  return "?";
}

export function ProfileScreen() {
  const { user, logout } = useAuth();
  const displayName = user?.first_name
    ? `${user.first_name}${user.last_name ? ` ${user.last_name}` : ""}`
    : user?.username ?? "User";
  const email = user?.email ?? "user@example.com";

  const styles = useThemedStyles(({ colors, typography }) =>
    StyleSheet.create({
      screen: {
        flex: 1,
        backgroundColor: "transparent",
      },
      avatarSection: {
        alignItems: "center",
        gap: spacing.sm,
        paddingVertical: spacing.xl,
      },
      displayName: {
        ...typography.title1,
        marginTop: spacing.sm,
      },
      email: {
        ...typography.callout,
        color: colors.inkMuted,
      },
      infoRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: spacing.md,
      },
      infoLabel: {
        ...typography.callout,
        color: colors.inkMuted,
      },
      infoValue: {
        ...typography.bodyMedium,
      },
      divider: {
        height: 1,
        backgroundColor: colors.border,
      },
      subscriptionRow: {
        marginBottom: spacing.lg,
      },
      subscriptionTier: {
        ...typography.title3,
        marginBottom: spacing.xs,
      },
      subscriptionDesc: {
        ...typography.callout,
        color: colors.inkMuted,
      },
      settingsCardContent: {
        paddingHorizontal: spacing.cardPadding,
      },
    }),
  );

  return (
    <GradientBackground variant="canvas">
      <View style={styles.screen}>
        <AppHeader title="Profile" />
        <TabScreenContainer gradient={false}>
          <View style={styles.avatarSection}>
            <Avatar initials={getInitials(user?.first_name, user?.username)} />
            <Text style={styles.displayName}>{displayName}</Text>
            <Text style={styles.email}>{email}</Text>
            <Chip label={`Member since ${profileMock.memberSince}`} variant="neutral" size="sm" />
          </View>

          <View>
            <SectionTitle title="Personal Info" />
            <AppCard variant="elevated">
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Name</Text>
                <Text style={styles.infoValue}>{displayName}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoValue}>{email}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Member since</Text>
                <Text style={styles.infoValue}>{profileMock.memberSince}</Text>
              </View>
            </AppCard>
          </View>

          <View>
            <SectionTitle title="Subscription" />
            <AppCard variant="floating" glow>
              <View style={styles.subscriptionRow}>
                <View>
                  <Text style={styles.subscriptionTier}>{profileMock.subscriptionTier} Plan</Text>
                  <Text style={styles.subscriptionDesc}>
                    Upgrade to unlock advanced coaching features
                  </Text>
                </View>
              </View>
              <AppButton label="Upgrade to Pro" variant="secondary" disabled onPress={() => {}} />
            </AppCard>
          </View>

          <View>
            <SectionTitle title="Account" />
            <AppCard variant="elevated" padding="none">
              <View style={styles.settingsCardContent}>
                <SettingsRow
                  label="Settings"
                  description="App preferences and appearance"
                  icon="settings-outline"
                  showChevron
                  onPress={() => router.push("/(app)/settings")}
                />
              </View>
            </AppCard>
          </View>

          <AppButton label="Log out" variant="secondary" onPress={() => logout()} />
        </TabScreenContainer>
      </View>
    </GradientBackground>
  );
}
