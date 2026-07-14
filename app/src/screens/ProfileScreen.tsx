import { StyleSheet, Text, View } from "react-native";
import { AppButton } from "../components/AppButton";
import { AppCard } from "../components/AppCard";
import { AppHeader } from "../components/AppHeader";
import { ScreenContainer } from "../components/ScreenContainer";
import { SectionTitle } from "../components/SectionTitle";
import { useAuth } from "../auth/useAuth";
import { profileMock } from "../data/mocks/profile";
import { colors, spacing, typography } from "../theme/theme";

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

  return (
    <View style={styles.screen}>
      <AppHeader title="Profile" />
      <ScreenContainer>
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {getInitials(user?.first_name, user?.username)}
            </Text>
          </View>
          <Text style={styles.displayName}>{displayName}</Text>
          <Text style={styles.email}>{email}</Text>
        </View>

        <View>
          <SectionTitle title="Personal Info" />
          <AppCard>
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
          <AppCard>
            <View style={styles.subscriptionRow}>
              <View>
                <Text style={styles.subscriptionTier}>{profileMock.subscriptionTier} Plan</Text>
                <Text style={styles.subscriptionDesc}>
                  Upgrade to unlock advanced coaching features
                </Text>
              </View>
            </View>
            <AppButton label="Upgrade to Pro" variant="secondary" onPress={() => {}} />
          </AppCard>
        </View>

        <AppButton label="Log out" variant="secondary" onPress={() => logout()} />
      </ScreenContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  avatarSection: {
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.lg,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 32,
    fontWeight: "700",
    color: colors.surface,
  },
  displayName: {
    ...typography.h2,
  },
  email: {
    ...typography.bodySmall,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.sm,
  },
  infoLabel: {
    ...typography.bodySmall,
  },
  infoValue: {
    ...typography.body,
    fontWeight: "600",
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
  },
  subscriptionRow: {
    marginBottom: spacing.lg,
  },
  subscriptionTier: {
    ...typography.h3,
    marginBottom: spacing.xs,
  },
  subscriptionDesc: {
    ...typography.bodySmall,
  },
});
