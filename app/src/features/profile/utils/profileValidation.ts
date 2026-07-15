import type { ProfileFormValues } from "./profileForm";

export type ProfileFormField =
  | "displayName"
  | "firstName"
  | "lastName"
  | "birthDate"
  | "gender"
  | "heightCm"
  | "weightKg"
  | "goal"
  | "bio";

export type ProfileFormErrors = Partial<Record<ProfileFormField, string>>;

export interface ProfileValidationResult {
  isValid: boolean;
  errors: ProfileFormErrors;
}

const MIN_AGE_YEARS = 13;
const MAX_AGE_YEARS = 120;
const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function parsePositiveNumber(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
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

export function validateProfileForm(form: ProfileFormValues): ProfileValidationResult {
  const errors: ProfileFormErrors = {};

  if (!form.firstName.trim()) {
    errors.firstName = "First name is required.";
  }

  // birthDate, gender, height, weight, and goal are optional on the backend
  // (`UserUpdate` accepts `None` for each) — only validate format/range when
  // the user has actually entered a value, never require them outright.
  const birthDate = form.birthDate.trim();
  if (birthDate && !isReasonableBirthDate(birthDate)) {
    errors.birthDate = "Enter a valid date of birth (YYYY-MM-DD).";
  }

  const heightInput = form.heightCm.trim();
  if (heightInput) {
    const height = parsePositiveNumber(heightInput);
    if (height == null) {
      errors.heightCm = "Enter a valid height.";
    } else if (height <= 0) {
      errors.heightCm = "Height must be greater than 0.";
    } else if (height > 300) {
      errors.heightCm = "Height must be 300 cm or less.";
    }
  }

  const weightInput = form.weightKg.trim();
  if (weightInput) {
    const weight = parsePositiveNumber(weightInput);
    if (weight == null) {
      errors.weightKg = "Enter a valid weight.";
    } else if (weight <= 0) {
      errors.weightKg = "Weight must be greater than 0.";
    } else if (weight > 500) {
      errors.weightKg = "Weight must be 500 kg or less.";
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
