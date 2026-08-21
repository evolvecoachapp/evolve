import DateTimePicker, {
  type DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { useState } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { AppButton } from "../../components/AppButton";
import { AppCard } from "../../components/AppCard";
import { AppInput } from "../../components/AppInput";
import { AuthScreenShell } from "../../components/AuthScreenShell";
import { SettingsRow } from "../profile/components/SettingsRow";
import { GENDER_OPTIONS, formatBirthDateDisplay } from "../profile/utils";
import type { ActivityLevel, Gender, Goal } from "../../types/api";
import { radius, spacing } from "../../theme/theme";
import { useThemedStyles } from "../../theme/useThemedStyles";
import { ACTIVITY_LEVEL_OPTIONS } from "./activityLevelOptions";
import { ATHLETE_SETUP_STEPS, type AthleteSetupErrors, type AthleteSetupValues } from "./models";
import { SETUP_GOAL_OPTIONS } from "./setupGoalOptions";
import { useAthleteSetup } from "./useAthleteSetup";

const MIN_AGE_YEARS = 13;
const MAX_AGE_YEARS = 120;

export interface AthleteSetupScreenProps {
  readonly onComplete: (values: AthleteSetupValues) => Promise<void>;
  readonly submitError?: string | null;
  readonly submitting?: boolean;
}

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

const STEP_COPY: Record<
  number,
  { overline: string; title: string; subtitle: string }
> = {
  [ATHLETE_SETUP_STEPS.IDENTITY]: {
    overline: "Athlete setup · 1 of 3",
    title: "Who we're coaching",
    subtitle: "A name, birth date, and sex let EVOLVE speak to you as an athlete — not a generic plan.",
  },
  [ATHLETE_SETUP_STEPS.BODY]: {
    overline: "Athlete setup · 2 of 3",
    title: "Your current numbers",
    subtitle: "Height and weight set the baseline for training load and nutrition. Metric for now.",
  },
  [ATHLETE_SETUP_STEPS.INTENT]: {
    overline: "Athlete setup · 3 of 3",
    title: "What we're training for",
    subtitle: "One primary goal and how you currently train. That's enough to start coaching.",
  },
};

function FieldError({ message, styles }: { message?: string; styles: { fieldError: object } }) {
  if (!message) {
    return null;
  }
  return <Text style={styles.fieldError}>{message}</Text>;
}

function IdentityStep({
  values,
  fieldErrors,
  onFieldChange,
  styles,
}: {
  values: AthleteSetupValues;
  fieldErrors: AthleteSetupErrors;
  onFieldChange: <K extends keyof AthleteSetupValues>(
    field: K,
    value: AthleteSetupValues[K],
  ) => void;
  styles: ReturnType<typeof useIdentityStyles>;
}) {
  const [showBirthDatePicker, setShowBirthDatePicker] = useState(false);
  const { minimumDate, maximumDate } = getBirthDateBounds();
  const selectedBirthDate = parseIsoToLocalDate(values.birthDate) ?? maximumDate;
  const birthDateDisplay = values.birthDate.trim()
    ? formatBirthDateDisplay(values.birthDate)
    : null;

  const handleBirthDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
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
        label="First name"
        value={values.firstName}
        onChangeText={(value) => onFieldChange("firstName", value)}
        placeholder="What should we call you?"
        autoCapitalize="words"
        error={fieldErrors.firstName}
      />

      <View style={styles.birthDateContainer}>
        <Text style={styles.birthDateLabel}>Date of birth</Text>
        <View
          style={[
            styles.birthDateShell,
            fieldErrors.birthDate ? styles.birthDateShellError : null,
          ]}
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Date of birth"
            testID="athlete-setup-birth-date"
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
        <FieldError message={fieldErrors.birthDate} styles={styles} />
        {showBirthDatePicker ? (
          <DateTimePicker
            testID="athlete-setup-birth-date-picker"
            value={selectedBirthDate}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            minimumDate={minimumDate}
            maximumDate={maximumDate}
            onChange={handleBirthDateChange}
          />
        ) : null}
      </View>

      <Text style={styles.sectionLabel}>Sex</Text>
      <View style={styles.optionGroup}>
        {GENDER_OPTIONS.map((option, index) => (
          <View key={option.value}>
            {index > 0 ? <View style={styles.divider} /> : null}
            <SettingsRow
              label={option.label}
              selected={values.gender === option.value}
              onPress={() => onFieldChange("gender", option.value as Gender)}
            />
          </View>
        ))}
      </View>
      <FieldError message={fieldErrors.gender} styles={styles} />
    </View>
  );
}

function BodyStep({
  values,
  fieldErrors,
  onFieldChange,
}: {
  values: AthleteSetupValues;
  fieldErrors: AthleteSetupErrors;
  onFieldChange: <K extends keyof AthleteSetupValues>(
    field: K,
    value: AthleteSetupValues[K],
  ) => void;
}) {
  return (
    <View>
      <AppInput
        label="Height (cm)"
        value={values.heightCm}
        onChangeText={(value) => onFieldChange("heightCm", value)}
        placeholder="e.g. 178"
        keyboardType="decimal-pad"
        error={fieldErrors.heightCm}
      />
      <AppInput
        label="Current weight (kg)"
        value={values.weightKg}
        onChangeText={(value) => onFieldChange("weightKg", value)}
        placeholder="e.g. 78"
        keyboardType="decimal-pad"
        error={fieldErrors.weightKg}
      />
    </View>
  );
}

function IntentStep({
  values,
  fieldErrors,
  showTargetWeight,
  onFieldChange,
  styles,
}: {
  values: AthleteSetupValues;
  fieldErrors: AthleteSetupErrors;
  showTargetWeight: boolean;
  onFieldChange: <K extends keyof AthleteSetupValues>(
    field: K,
    value: AthleteSetupValues[K],
  ) => void;
  styles: ReturnType<typeof useIdentityStyles>;
}) {
  return (
    <View>
      <Text style={styles.sectionLabel}>Primary goal</Text>
      <View style={styles.optionGroup}>
        {SETUP_GOAL_OPTIONS.map((option, index) => (
          <View key={option.value}>
            {index > 0 ? <View style={styles.divider} /> : null}
            <SettingsRow
              label={option.label}
              description={option.description}
              selected={values.goal === option.value}
              onPress={() => onFieldChange("goal", option.value as Goal)}
            />
          </View>
        ))}
      </View>
      <FieldError message={fieldErrors.goal} styles={styles} />

      {showTargetWeight ? (
        <AppInput
          label="Target weight (kg)"
          value={values.targetWeightKg}
          onChangeText={(value) => onFieldChange("targetWeightKg", value)}
          placeholder="Where do you want to land?"
          keyboardType="decimal-pad"
          error={fieldErrors.targetWeightKg}
        />
      ) : null}

      <Text style={styles.sectionLabel}>How you train today</Text>
      <View style={styles.optionGroup}>
        {ACTIVITY_LEVEL_OPTIONS.map((option, index) => (
          <View key={option.value}>
            {index > 0 ? <View style={styles.divider} /> : null}
            <SettingsRow
              label={option.label}
              description={option.description}
              selected={values.activityLevel === option.value}
              onPress={() => onFieldChange("activityLevel", option.value as ActivityLevel)}
            />
          </View>
        ))}
      </View>
      <FieldError message={fieldErrors.activityLevel} styles={styles} />
    </View>
  );
}

function useIdentityStyles() {
  return useThemedStyles(({ colors, typography, shadows }) =>
    StyleSheet.create({
      header: {
        gap: spacing.xs,
        marginBottom: spacing.sm,
      },
      overline: {
        ...typography.eyebrow,
        color: colors.pulse,
      },
      title: {
        ...typography.title1,
      },
      subtitle: {
        ...typography.callout,
        color: colors.inkMuted,
      },
      formCard: {
        gap: spacing.sm,
      },
      actions: {
        gap: spacing.sm,
      },
      error: {
        ...typography.callout,
        color: colors.critical,
      },
      fieldError: {
        ...typography.caption,
        color: colors.error,
        marginBottom: spacing.md,
      },
      sectionLabel: {
        ...typography.callout,
        color: colors.inkSecondary,
        fontWeight: "600",
        marginBottom: spacing.xs,
      },
      optionGroup: {
        marginBottom: spacing.md,
      },
      divider: {
        height: 1,
        backgroundColor: colors.border,
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
    }),
  );
}

export function AthleteSetupScreen({
  onComplete,
  submitError,
  submitting = false,
}: AthleteSetupScreenProps) {
  const setup = useAthleteSetup();
  const styles = useIdentityStyles();
  const copy = STEP_COPY[setup.step];

  const handlePrimary = async () => {
    if (!setup.isLastStep) {
      setup.goNext();
      return;
    }
    if (!setup.validateCurrentStep()) {
      return;
    }
    await onComplete(setup.values);
  };

  return (
    <AuthScreenShell>
      <View style={styles.header}>
        <Text style={styles.overline}>{copy.overline}</Text>
        <Text style={styles.title}>{copy.title}</Text>
        <Text style={styles.subtitle}>{copy.subtitle}</Text>
      </View>
      <AppCard variant="floating" style={styles.formCard}>
        {setup.step === ATHLETE_SETUP_STEPS.IDENTITY ? (
          <IdentityStep
            values={setup.values}
            fieldErrors={setup.fieldErrors}
            onFieldChange={setup.updateField}
            styles={styles}
          />
        ) : null}
        {setup.step === ATHLETE_SETUP_STEPS.BODY ? (
          <BodyStep
            values={setup.values}
            fieldErrors={setup.fieldErrors}
            onFieldChange={setup.updateField}
          />
        ) : null}
        {setup.step === ATHLETE_SETUP_STEPS.INTENT ? (
          <IntentStep
            values={setup.values}
            fieldErrors={setup.fieldErrors}
            showTargetWeight={setup.showTargetWeight}
            onFieldChange={setup.updateField}
            styles={styles}
          />
        ) : null}
        {submitError ? <Text style={styles.error}>{submitError}</Text> : null}
      </AppCard>
      <View style={styles.actions}>
        <AppButton
          label={setup.isLastStep ? "Save athlete profile" : "Continue"}
          size="lg"
          onPress={() => void handlePrimary()}
          loading={submitting}
          disabled={submitting}
        />
        {setup.step > ATHLETE_SETUP_STEPS.IDENTITY ? (
          <AppButton
            label="Back"
            variant="secondary"
            onPress={setup.goBack}
            disabled={submitting}
          />
        ) : null}
      </View>
    </AuthScreenShell>
  );
}
