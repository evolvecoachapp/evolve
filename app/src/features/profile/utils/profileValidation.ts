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

  if (!form.birthDate.trim()) {
    errors.birthDate = "Date of birth is required.";
  } else if (!isReasonableBirthDate(form.birthDate.trim())) {
    errors.birthDate = "Enter a valid date of birth (YYYY-MM-DD).";
  }

  if (!form.gender) {
    errors.gender = "Gender is required.";
  }

  const height = parsePositiveNumber(form.heightCm);
  if (height == null) {
    errors.heightCm = "Height is required.";
  } else if (height <= 0) {
    errors.heightCm = "Height must be greater than 0.";
  } else if (height > 300) {
    errors.heightCm = "Height must be 300 cm or less.";
  }

  const weight = parsePositiveNumber(form.weightKg);
  if (weight == null) {
    errors.weightKg = "Weight is required.";
  } else if (weight <= 0) {
    errors.weightKg = "Weight must be greater than 0.";
  } else if (weight > 500) {
    errors.weightKg = "Weight must be 500 kg or less.";
  }

  if (!form.goal) {
    errors.goal = "Primary goal is required.";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
