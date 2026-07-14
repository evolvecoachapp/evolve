import type { UserUpdate } from "../../../types/api";
import type { Gender, FitnessGoal, UserProfile } from "../../shared/models";

/** Editable profile form state — includes local-only fields not yet persisted by the API. */
export interface ProfileFormValues {
  /** Local preview only until backend adds `display_name`. */
  displayName: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  gender: Gender | null;
  heightCm: string;
  weightKg: string;
  goal: FitnessGoal | null;
  /** Local-only until backend adds `bio`. */
  bio: string;
}

export function buildProfileFormValues(
  profile: UserProfile | null,
  displayName: string,
): ProfileFormValues {
  return {
    displayName,
    firstName: profile?.firstName ?? "",
    lastName: profile?.lastName ?? "",
    birthDate: profile?.birthDate ?? "",
    gender: profile?.gender ?? null,
    heightCm: profile?.heightCm != null ? String(profile.heightCm) : "",
    weightKg: profile?.currentWeightKg != null ? String(profile.currentWeightKg) : "",
    goal: profile?.goal ?? null,
    bio: "",
  };
}

function normalizeText(value: string): string {
  return value.trim();
}

function parsePositiveNumber(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}

/** Maps supported form fields to the API `UserUpdate` contract. */
export function profileFormToUserUpdate(form: ProfileFormValues): UserUpdate {
  const height = parsePositiveNumber(form.heightCm);
  const weight = parsePositiveNumber(form.weightKg);

  return {
    first_name: normalizeText(form.firstName) || null,
    last_name: normalizeText(form.lastName) || null,
    birth_date: normalizeText(form.birthDate) || null,
    gender: form.gender,
    height_cm: height,
    current_weight_kg: weight,
    goal: form.goal,
  };
}

function persistedFieldChanged(
  current: string | number | null | undefined,
  next: string | number | null | undefined,
): boolean {
  const normalizedCurrent = current ?? null;
  const normalizedNext = next ?? null;
  return normalizedCurrent !== normalizedNext;
}

/** True when any backend-persisted field differs from the loaded profile. */
export function hasProfileFormChanges(
  form: ProfileFormValues,
  profile: UserProfile | null,
): boolean {
  if (!profile) {
    return false;
  }

  const update = profileFormToUserUpdate(form);

  return (
    persistedFieldChanged(profile.firstName, update.first_name ?? null) ||
    persistedFieldChanged(profile.lastName, update.last_name ?? null) ||
    persistedFieldChanged(profile.birthDate, update.birth_date ?? null) ||
    persistedFieldChanged(profile.gender, update.gender ?? null) ||
    persistedFieldChanged(profile.heightCm, update.height_cm ?? null) ||
    persistedFieldChanged(profile.currentWeightKg, update.current_weight_kg ?? null) ||
    persistedFieldChanged(profile.goal, update.goal ?? null)
  );
}

export function formatProfileValue(
  value: string | number | null | undefined,
  fallback = "—",
): string {
  if (value == null || value === "") {
    return fallback;
  }
  return String(value);
}
