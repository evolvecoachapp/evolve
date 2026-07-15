import DateTimePicker, {
  type DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { useMemo, useState } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { AppInput } from "../../../components/AppInput";
import type { Gender, FitnessGoal } from "../../shared/models";
import { radius, spacing } from "../../../theme/theme";
import { useThemedStyles } from "../../../theme/useThemedStyles";
import { SettingsRow } from "./SettingsRow";
import {
  GENDER_OPTIONS,
  GOAL_OPTIONS,
  formatBirthDateDisplay,
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

const MIN_AGE_YEARS = 13;
const MAX_AGE_YEARS = 120;

function dateToIso(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseIsoToLocalDate(iso: string): Date | null {
  const trimmed = iso.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return null;
  }

  const [year, month, day] = trimmed.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
}

function getBirthDateBounds(): { minimumDate: Date; maximumDate: Date } {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const minimumDate = new Date(today);
  minimumDate.setFullYear(today.getFullYear() - MAX_AGE_YEARS);

  const maximumDate = new Date(today);
  maximumDate.setFullYear(today.getFullYear() - MIN_AGE_YEARS);

  return { minimumDate, maximumDate };
}

export function ProfileEditForm({
  email,
  form,
  fieldErrors,
  onFieldChange,
}: ProfileEditFormProps) {
  const [showBirthDatePicker, setShowBirthDatePicker] = useState(false);
  const { minimumDate, maximumDate } = useMemo(() => getBirthDateBounds(), []);

  const styles = useThemedStyles(({ colors, typography, shadows }) =>
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
      birthDateContainer: {
        marginBottom: spacing.lg,
      },
      birthDateLabel: {
        ...typography.caption,
        marginBottom: spacing.xs + spacing.xs,
        color: colors.inkSecondary,
        fontWeight: "600",
      },
      birthDateShell: {
        borderRadius: radius.lg,
        backgroundColor: colors.surfaceElevated,
        borderWidth: 1,
        borderColor: colors.border,
        ...shadows.card,
      },
      birthDateShellError: {
        borderColor: colors.error,
      },
      birthDatePressable: {
        borderRadius: radius.lg,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md + spacing.xs,
      },
      birthDateValue: {
        ...typography.body,
        color: colors.ink,
      },
      birthDatePlaceholder: {
        ...typography.body,
        color: colors.inkMuted,
      },
      birthDateError: {
        ...typography.caption,
        color: colors.error,
        marginTop: spacing.xs,
      },
      iosPickerContainer: {
        marginTop: spacing.sm,
      },
    }),
  );

  const selectedBirthDate =
    parseIsoToLocalDate(form.birthDate) ?? maximumDate;
  const birthDateDisplay = form.birthDate.trim()
    ? formatBirthDateDisplay(form.birthDate)
    : null;

  const handleBirthDateChange = (
    event: DateTimePickerEvent,
    selectedDate?: Date,
  ) => {
    if (Platform.OS === "android") {
      setShowBirthDatePicker(false);
    }

    if (event.type === "dismissed" || !selectedDate) {
      return;
    }

    onFieldChange("birthDate", dateToIso(selectedDate));
  };

  return (
    <View>
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

      <View style={styles.birthDateContainer}>
        <Text style={styles.birthDateLabel}>Date of Birth</Text>
        <View
          style={[
            styles.birthDateShell,
            fieldErrors.birthDate ? styles.birthDateShellError : null,
          ]}
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Date of Birth"
            testID="birth-date-picker-trigger"
            style={styles.birthDatePressable}
            onPress={() => setShowBirthDatePicker(true)}
          >
            {birthDateDisplay ? (
              <Text style={styles.birthDateValue}>{birthDateDisplay}</Text>
            ) : (
              <Text style={styles.birthDatePlaceholder}>Select date of birth</Text>
            )}
          </Pressable>
        </View>
        {fieldErrors.birthDate ? (
          <Text style={styles.birthDateError}>{fieldErrors.birthDate}</Text>
        ) : null}
        {showBirthDatePicker ? (
          <View style={styles.iosPickerContainer}>
            <DateTimePicker
              testID="birth-date-picker"
              value={selectedBirthDate}
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              minimumDate={minimumDate}
              maximumDate={maximumDate}
              onChange={handleBirthDateChange}
            />
          </View>
        ) : null}
      </View>

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
    </View>
  );
}
