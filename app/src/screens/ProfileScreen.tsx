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
import { ProfileEditForm, SettingsRow } from "../features/profile/components";
import { useProfileEdit } from "../features/profile/hooks/useProfileEdit";
import { useCurrentUser } from "../features/shared";
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
  const { logout } = useAuth();
  const {
    profile,
    user,
    displayName,
    email,
    memberSince,
    subscriptionTier,
    updateProfile,
    refresh,
    saving: hookSaving,
  } = useCurrentUser();

  const {
    isEditing,
    form,
    fieldErrors,
    submitError,
    successMessage,
    saving,
    canSave,
    enterEditMode,
    cancelEdit,
    updateField,
    save,
  } = useProfileEdit({
    profile,
    displayName,
    updateProfile,
    refresh,
  });

  const isSaving = saving || hookSaving;

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
      editActions: {
        gap: spacing.md,
        marginTop: spacing.md,
      },
      feedbackText: {
        ...typography.callout,
        textAlign: "center",
      },
      successText: {
        color: colors.success,
      },
      errorText: {
        color: colors.error,
      },
      changePhotoButton: {
        marginTop: spacing.xs,
      },
    }),
  );

  return (
    <GradientBackground variant="canvas">
      <View style={styles.screen}>
        <AppHeader title="Profile" />
        <TabScreenContainer gradient={false}>
          <View style={styles.avatarSection}>
            <Avatar initials={getInitials(profile?.firstName, user?.username)} />
            <Text style={styles.displayName}>{displayName}</Text>
            <Text style={styles.email}>{email}</Text>
            <Chip label={`Member since ${memberSince}`} variant="neutral" size="sm" />
            {isEditing ? (
              <AppButton
                label="Change photo"
                variant="ghost"
                size="sm"
                disabled
                onPress={() => {}}
                style={styles.changePhotoButton}
              />
            ) : null}
          </View>

          {successMessage ? (
            <Text style={[styles.feedbackText, styles.successText]}>{successMessage}</Text>
          ) : null}

          <View>
            <SectionTitle title="Personal Info" />
            <AppCard variant="elevated">
              {isEditing ? (
                <ProfileEditForm
                  email={email}
                  form={form}
                  fieldErrors={fieldErrors}
                  onFieldChange={updateField}
                />
              ) : (
                <>
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
                    <Text style={styles.infoValue}>{memberSince}</Text>
                  </View>
                </>
              )}
            </AppCard>

            {isEditing ? (
              <View style={styles.editActions}>
                {submitError ? (
                  <Text style={[styles.feedbackText, styles.errorText]}>{submitError}</Text>
                ) : null}
                <AppButton
                  label="Save"
                  onPress={() => void save()}
                  loading={isSaving}
                  disabled={!canSave}
                />
                <AppButton
                  label="Cancel"
                  variant="secondary"
                  onPress={cancelEdit}
                  disabled={isSaving}
                />
              </View>
            ) : (
              <View style={styles.editActions}>
                <AppButton label="Edit Profile" variant="secondary" onPress={enterEditMode} />
              </View>
            )}
          </View>

          <View>
            <SectionTitle title="Subscription" />
            <AppCard variant="floating" glow>
              <View style={styles.subscriptionRow}>
                <View>
                  <Text style={styles.subscriptionTier}>{subscriptionTier} Plan</Text>
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
