import type { AthleteSetupErrors, AthleteSetupStep, AthleteSetupValues } from "./models";
import { ATHLETE_SETUP_STEPS, needsTargetWeight } from "./models";
import { parsePositiveNumber } from "./parsePositiveNumber";

const MIN_AGE_YEARS = 13;
const MAX_AGE_YEARS = 120;
const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const MAX_HEIGHT_CM = 300;
const MAX_WEIGHT_KG = 500;

export interface AthleteSetupValidationResult {
  readonly isValid: boolean;
  readonly errors: AthleteSetupErrors;
}

function isReasonableBirthDate(value: string): boolean {
  if (!ISO_DATE_PATTERN.test(value)) {
    return false;
  }

  const [year, month, day] = value.split("-").map(Number);
  const birthDate = new Date(year, month - 1, day);
  if (
    birthDate.getFullYear() !== year ||
    birthDate.getMonth() !== month - 1 ||
    birthDate.getDate() !== day
  ) {
    return false;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (birthDate > today) {
    return false;
  }

  const minDate = new Date(today);
  minDate.setFullYear(today.getFullYear() - MAX_AGE_YEARS);
  const maxDate = new Date(today);
  maxDate.setFullYear(today.getFullYear() - MIN_AGE_YEARS);

  return birthDate >= minDate && birthDate <= maxDate;
}

function validateMeasurement(
  raw: string,
  label: string,
  max: number,
): string | undefined {
  const trimmed = raw.trim();
  if (!trimmed) {
    return `${label} is required.`;
  }
  const parsed = Number(trimmed);
  if (!Number.isFinite(parsed)) {
    return `Enter a valid ${label.toLowerCase()}.`;
  }
  if (parsed <= 0) {
    return `${label} must be greater than 0.`;
  }
  if (parsed > max) {
    return `${label} must be ${max} or less.`;
  }
  return undefined;
}

export function validateAthleteSetupStep(
  values: AthleteSetupValues,
  step: AthleteSetupStep,
): AthleteSetupValidationResult {
  const errors: AthleteSetupErrors = {};

  if (step === ATHLETE_SETUP_STEPS.IDENTITY) {
    if (!values.firstName.trim()) {
      errors.firstName = "First name is required.";
    }
    const birthDate = values.birthDate.trim();
    if (!birthDate) {
      errors.birthDate = "Date of birth is required.";
    } else if (!isReasonableBirthDate(birthDate)) {
      errors.birthDate = "Enter a valid date of birth.";
    }
    if (!values.gender) {
      errors.gender = "Choose how we should coach you.";
    }
  }

  if (step === ATHLETE_SETUP_STEPS.BODY) {
    const heightError = validateMeasurement(values.heightCm, "Height", MAX_HEIGHT_CM);
    if (heightError) {
      errors.heightCm = heightError;
    }
    const weightError = validateMeasurement(values.weightKg, "Weight", MAX_WEIGHT_KG);
    if (weightError) {
      errors.weightKg = weightError;
    }
  }

  if (step === ATHLETE_SETUP_STEPS.INTENT) {
    if (!values.goal) {
      errors.goal = "Choose a primary training goal.";
    }
    if (!values.activityLevel) {
      errors.activityLevel = "Choose how often you currently train.";
    }
    if (needsTargetWeight(values.goal)) {
      const targetError = validateMeasurement(
        values.targetWeightKg,
        "Target weight",
        MAX_WEIGHT_KG,
      );
      if (targetError) {
        errors.targetWeightKg = targetError;
      } else {
        const current = parsePositiveNumber(values.weightKg);
        const target = parsePositiveNumber(values.targetWeightKg);
        if (current != null && target != null && current === target) {
          errors.targetWeightKg = "Target weight should differ from your current weight.";
        }
      }
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateAthleteSetup(values: AthleteSetupValues): AthleteSetupValidationResult {
  const identity = validateAthleteSetupStep(values, ATHLETE_SETUP_STEPS.IDENTITY);
  const body = validateAthleteSetupStep(values, ATHLETE_SETUP_STEPS.BODY);
  const intent = validateAthleteSetupStep(values, ATHLETE_SETUP_STEPS.INTENT);
  return {
    isValid: identity.isValid && body.isValid && intent.isValid,
    errors: { ...identity.errors, ...body.errors, ...intent.errors },
  };
}
