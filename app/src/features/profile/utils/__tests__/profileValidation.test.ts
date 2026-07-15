import {
  buildProfileFormValues,
  hasProfileFormChanges,
  profileFormToUserUpdate,
} from "../profileForm";
import { validateProfileForm } from "../profileValidation";

const baseProfile = {
  userId: "user-1",
  firstName: "Alex",
  lastName: "Rivera",
  displayName: "Alex Rivera",
  avatarUrl: null,
  birthDate: "1995-06-15",
  gender: "prefer_not_to_say" as const,
  heightCm: 178,
  currentWeightKg: 78,
  targetWeightKg: 75,
  activityLevel: "moderately_active" as const,
  goal: "gain_muscle" as const,
  updatedAt: "2026-07-01T00:00:00.000Z",
};

describe("profileValidation", () => {
  it("accepts a complete valid form", () => {
    const form = buildProfileFormValues(baseProfile, "Alex Rivera");
    expect(validateProfileForm(form).isValid).toBe(true);
  });

  it("requires first name", () => {
    const form = buildProfileFormValues(baseProfile, "Alex Rivera");
    form.firstName = "   ";
    expect(validateProfileForm(form).errors.firstName).toBeDefined();
  });

  it("rejects non-positive height and weight", () => {
    const form = buildProfileFormValues(baseProfile, "Alex Rivera");
    form.heightCm = "0";
    form.weightKg = "-5";
    const result = validateProfileForm(form);
    expect(result.errors.heightCm).toBeDefined();
    expect(result.errors.weightKg).toBeDefined();
  });

  it("rejects future and invalid birth dates", () => {
    const form = buildProfileFormValues(baseProfile, "Alex Rivera");
    form.birthDate = "2099-01-01";
    expect(validateProfileForm(form).errors.birthDate).toBeDefined();

    form.birthDate = "not-a-date";
    expect(validateProfileForm(form).errors.birthDate).toBeDefined();
  });
});

describe("profileForm helpers", () => {
  it("detects when persisted fields changed", () => {
    const form = buildProfileFormValues(baseProfile, "Alex Rivera");
    expect(hasProfileFormChanges(form, baseProfile)).toBe(false);

    form.firstName = "Jordan";
    expect(hasProfileFormChanges(form, baseProfile)).toBe(true);
  });

  it("maps editable fields to UserUpdate", () => {
    const form = buildProfileFormValues(baseProfile, "Alex Rivera");
    form.firstName = "Jordan";
    form.lastName = "Lee";

    expect(profileFormToUserUpdate(form)).toEqual({
      first_name: "Jordan",
      last_name: "Lee",
      birth_date: "1995-06-15",
      gender: "prefer_not_to_say",
      height_cm: 178,
      current_weight_kg: 78,
      goal: "gain_muscle",
    });
  });
});

describe("buildProfileFormValues firstName initialization (Sprint 6.1.8)", () => {
  it("uses profile.firstName for accounts that already have first_name", () => {
    const form = buildProfileFormValues(baseProfile, "Alex Rivera", "evolve_user");

    expect(form.firstName).toBe("Alex");
    expect(validateProfileForm(form).isValid).toBe(true);
  });

  it("falls back to profile.displayName for legacy accounts with null first_name", () => {
    const legacyProfile = {
      ...baseProfile,
      firstName: null,
      lastName: null,
      displayName: "antonello",
    };

    const form = buildProfileFormValues(legacyProfile, "antonello", "antonello");

    expect(form.firstName).toBe("antonello");
    expect(validateProfileForm(form).isValid).toBe(true);
  });

  it("falls back to username when profile is null", () => {
    const form = buildProfileFormValues(null, "antonello", "antonello");

    expect(form.firstName).toBe("antonello");
    expect(validateProfileForm(form).isValid).toBe(true);
  });

  it("keeps first_name for partially completed accounts with other fields unset", () => {
    const partialProfile = {
      ...baseProfile,
      birthDate: null,
      gender: null,
      heightCm: null,
      currentWeightKg: null,
      goal: null,
    };

    const form = buildProfileFormValues(partialProfile, "Alex Rivera", "evolve_user");

    expect(form.firstName).toBe("Alex");
    expect(validateProfileForm(form).isValid).toBe(true);
  });
});
