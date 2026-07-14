import { StyleSheet, Text, View } from "react-native";
import { AppInput } from "../../../components/AppInput";
import type { Gender, FitnessGoal } from "../../shared/models";
import { spacing } from "../../../theme/theme";
import { useThemedStyles } from "../../../theme/useThemedStyles";
import { SettingsRow } from "./SettingsRow";
import {
  GENDER_OPTIONS,
  GOAL_OPTIONS,
  type ProfileFormErrors,
  type ProfileFormValues,
} from "../utils";

interface ProfileEditFormProps {
  email: string;
  form: ProfileFormValues;
  fieldErrors: ProfileFormErrors;
  onFieldChange: <K extends keyof ProfileFormValues>(
    field: K,
    value: ProfileFormValues[K],
  ) => void;
}

export function ProfileEditForm({
  email,
  form,
  fieldErrors,
  onFieldChange,
}: ProfileEditFormProps) {
  const styles = useThemedStyles(({ colors, typography }) =>
    StyleSheet.create({
      sectionLabel: {
        ...typography.callout,
        color: colors.inkSecondary,
        fontWeight: "600",
        marginBottom: spacing.xs,
      },
      helperText: {
        ...typography.caption,
        color: colors.inkMuted,
        marginTop: -spacing.md,
        marginBottom: spacing.lg,
      },
      divider: {
        height: 1,
        backgroundColor: colors.border,
      },
      optionGroup: {
        marginBottom: spacing.md,
      },
      fieldError: {
        ...typography.caption,
        color: colors.error,
        marginBottom: spacing.md,
      },
    }),
  );

  return (
    <View>
      <AppInput
        label="Display Name"
        value={form.displayName}
        editable={false}
        placeholder="Display name"
      />
      <Text style={styles.helperText}>
        Not saved yet — backend support for a dedicated display name is coming soon.
      </Text>

      <AppInput
        label="First Name"
        value={form.firstName}
        onChangeText={(value) => onFieldChange("firstName", value)}
        placeholder="First name"
        autoCapitalize="words"
        error={fieldErrors.firstName}
      />

      <AppInput
        label="Last Name"
        value={form.lastName}
        onChangeText={(value) => onFieldChange("lastName", value)}
        placeholder="Last name"
        autoCapitalize="words"
        error={fieldErrors.lastName}
      />

      <AppInput
        label="Email"
        value={email}
        editable={false}
        placeholder="Email"
      />
      <Text style={styles.helperText}>Email cannot be changed here.</Text>

      <AppInput
        label="Date of Birth"
        value={form.birthDate}
        onChangeText={(value) => onFieldChange("birthDate", value)}
        placeholder="YYYY-MM-DD"
        keyboardType="numbers-and-punctuation"
        error={fieldErrors.birthDate}
      />

      <Text style={styles.sectionLabel}>Gender</Text>
      <View style={styles.optionGroup}>
        {GENDER_OPTIONS.map((option, index) => (
          <View key={option.value}>
            {index > 0 ? <View style={styles.divider} /> : null}
            <SettingsRow
              label={option.label}
              selected={form.gender === option.value}
              onPress={() => onFieldChange("gender", option.value as Gender)}
            />
          </View>
        ))}
      </View>
      {fieldErrors.gender ? (
        <Text style={styles.fieldError}>{fieldErrors.gender}</Text>
      ) : null}

      <AppInput
        label="Height (cm)"
        value={form.heightCm}
        onChangeText={(value) => onFieldChange("heightCm", value)}
        placeholder="e.g. 178"
        keyboardType="decimal-pad"
        error={fieldErrors.heightCm}
      />

      <AppInput
        label="Weight (kg)"
        value={form.weightKg}
        onChangeText={(value) => onFieldChange("weightKg", value)}
        placeholder="e.g. 78"
        keyboardType="decimal-pad"
        error={fieldErrors.weightKg}
      />

      <Text style={styles.sectionLabel}>Primary Goal</Text>
      <View style={styles.optionGroup}>
        {GOAL_OPTIONS.map((option, index) => (
          <View key={option.value}>
            {index > 0 ? <View style={styles.divider} /> : null}
            <SettingsRow
              label={option.label}
              selected={form.goal === option.value}
              onPress={() => onFieldChange("goal", option.value as FitnessGoal)}
            />
          </View>
        ))}
      </View>
      {fieldErrors.goal ? (
        <Text style={styles.fieldError}>{fieldErrors.goal}</Text>
      ) : null}

      <AppInput
        label="Bio (optional)"
        value={form.bio}
        editable={false}
        placeholder="Tell us about yourself"
        multiline
      />
      <Text style={styles.helperText}>
        Not saved yet — bio will be available in a future update.
      </Text>
    </View>
  );
}
