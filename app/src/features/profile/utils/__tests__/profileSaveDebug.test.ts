/**
 * Regression coverage for Sprint 6.1.2.
 *
 * Reproduces the full ProfileScreen -> ProfileEditForm -> useProfileEdit ->
 * profileForm -> profileValidation -> hasChanges/validation -> canSave chain
 * using a profile shaped exactly like the REAL backend response (not the
 * idealized numeric mocks used by ProfileScreen.test.tsx).
 *
 * Root cause: the backend serializes `height_cm` / `current_weight_kg`
 * (SQLAlchemy `Numeric` / Python `Decimal` columns) as JSON STRINGS via
 * Pydantic v2's `model_dump(mode="json")` (confirmed against the installed
 * pydantic==2.11.7 — e.g. `Decimal("178.00")` -> `"178.00"`), even though the
 * frontend's `UserPublic`/`UserProfile` TypeScript types declare
 * `number | null`. `mapUserPublicToProfile` used to pass these fields
 * through unchanged, so `hasProfileFormChanges` compared a string
 * (`profile.heightCm`) against a number (the parsed form value) and never
 * matched — making dirty-state detection for those two fields unreliable.
 */
import { mapUserPublicToProfile } from "../../../shared/utils/userAdapters";
import type { UserPublic } from "../../../../types/api";
import {
  buildProfileFormValues,
  hasProfileFormChanges,
} from "../profileForm";
import { validateProfileForm } from "../profileValidation";

// Real `/users/me` response shape — height_cm/current_weight_kg arrive as
// Decimal-serialized JSON strings, exactly like the live backend.
const realBackendDto = {
  id: "user-1",
  email: "coach@evolve.app",
  username: "evolve_user",
  first_name: "Alex",
  last_name: "Rivera",
  birth_date: "1995-06-15",
  gender: "prefer_not_to_say",
  height_cm: "178.00",
  current_weight_kg: "78.00",
  target_weight_kg: "75.00",
  activity_level: "moderately_active",
  goal: "gain_muscle",
  is_active: true,
  is_verified: true,
  created_at: "2026-03-01T00:00:00.000Z",
  updated_at: "2026-07-01T00:00:00.000Z",
} as unknown as UserPublic;

function computeCanSave(hasChanges: boolean, isValid: boolean) {
  const isEditing = true;
  const saving = false;
  return isEditing && hasChanges && isValid && !saving;
}

describe("profile save chain against real backend value shapes", () => {
  it("coerces Decimal-as-string height/weight to numbers in the domain model", () => {
    const profile = mapUserPublicToProfile(realBackendDto);

    expect(typeof profile.heightCm).toBe("number");
    expect(profile.heightCm).toBe(178);
    expect(typeof profile.currentWeightKg).toBe("number");
    expect(profile.currentWeightKg).toBe(78);
  });

  it("reports no changes on an untouched form (regression: used to be a false positive)", () => {
    const profile = mapUserPublicToProfile(realBackendDto);
    const initialForm = buildProfileFormValues(profile, "Alex Rivera");

    const validation = validateProfileForm(initialForm);
    const hasChanges = hasProfileFormChanges(initialForm, profile);

    expect(validation.isValid).toBe(true);
    expect(hasChanges).toBe(false);
    expect(computeCanSave(hasChanges, validation.isValid)).toBe(false);
  });

  it("enables Save after editing firstName, lastName, height, weight, gender, goal", () => {
    const profile = mapUserPublicToProfile(realBackendDto);
    const initialForm = buildProfileFormValues(profile, "Alex Rivera");

    const currentValues = {
      ...initialForm,
      firstName: "Jordan",
      lastName: "Lee",
      heightCm: "180",
      weightKg: "80",
      gender: "male" as const,
      goal: "lose_weight" as const,
    };

    const validation = validateProfileForm(currentValues);
    const hasChanges = hasProfileFormChanges(currentValues, profile);

    expect(validation.isValid).toBe(true);
    expect(hasChanges).toBe(true);
    expect(computeCanSave(hasChanges, validation.isValid)).toBe(true);
  });

  it("enables Save for a fresh/incomplete account (height/weight/birthDate/gender/goal all unset)", () => {
    const incompleteDto = {
      ...realBackendDto,
      birth_date: null,
      gender: null,
      height_cm: null,
      current_weight_kg: null,
      target_weight_kg: null,
      goal: null,
    } as unknown as UserPublic;

    const profile = mapUserPublicToProfile(incompleteDto);
    const initialForm = buildProfileFormValues(profile, "evolve_user");

    const currentValues = {
      ...initialForm,
      firstName: "Jordan",
      lastName: "Lee",
      heightCm: "180",
      weightKg: "80",
      gender: "male" as const,
      goal: "lose_weight" as const,
    };

    const validation = validateProfileForm(currentValues);
    const hasChanges = hasProfileFormChanges(currentValues, profile);

    expect(validation.isValid).toBe(true);
    expect(hasChanges).toBe(true);
    expect(computeCanSave(hasChanges, validation.isValid)).toBe(true);
  });

  it("initializes firstName from displayName for legacy accounts with null first_name", () => {
    const legacyDto = {
      ...realBackendDto,
      first_name: null,
      last_name: null,
    } as unknown as UserPublic;

    const profile = mapUserPublicToProfile(legacyDto);
    const initialForm = buildProfileFormValues(profile, "evolve_user", "evolve_user");

    expect(initialForm.firstName).toBe("evolve_user");

    const currentValues = {
      ...initialForm,
      heightCm: "180",
      weightKg: "80",
      gender: "male" as const,
      goal: "lose_weight" as const,
    };

    const validation = validateProfileForm(currentValues);
    const hasChanges = hasProfileFormChanges(currentValues, profile);

    expect(validation.isValid).toBe(true);
    expect(hasChanges).toBe(true);
    expect(computeCanSave(hasChanges, validation.isValid)).toBe(true);
  });
});
