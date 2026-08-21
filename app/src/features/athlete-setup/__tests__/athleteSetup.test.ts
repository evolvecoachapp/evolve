import type { UserPublic } from "../../../types/api";
import { ACTIVITY_LEVEL_OPTIONS } from "../activityLevelOptions";
import {
  isAthleteSetupComplete,
  isBackendProfileComplete,
} from "../isBackendProfileComplete";
import { mapSetupToUserUpdate } from "../mapSetupToUserUpdate";
import {
  createEmptyAthleteSetupValues,
  needsTargetWeight,
  type AthleteSetupValues,
} from "../models";
import { validateAthleteSetup, validateAthleteSetupStep } from "../validation";
import { ATHLETE_SETUP_STEPS } from "../models";

function completeValues(overrides: Partial<AthleteSetupValues> = {}): AthleteSetupValues {
  return {
    firstName: "Jordan",
    birthDate: "1994-02-10",
    gender: "female",
    heightCm: "170",
    weightKg: "62",
    goal: "general_fitness",
    activityLevel: "moderately_active",
    targetWeightKg: "",
    ...overrides,
  };
}

function completeUser(overrides: Partial<UserPublic> = {}): UserPublic {
  return {
    id: "user-1",
    email: "jordan@evolve.app",
    username: "jordan",
    first_name: "Jordan",
    last_name: null,
    birth_date: "1994-02-10",
    gender: "female",
    height_cm: 170,
    current_weight_kg: 62,
    target_weight_kg: null,
    activity_level: "moderately_active",
    goal: "general_fitness",
    is_active: true,
    is_verified: true,
    created_at: "2026-01-15T00:00:00.000Z",
    updated_at: "2026-08-21T00:00:00.000Z",
    ...overrides,
  };
}

describe("athlete setup mapping and validation", () => {
  it("maps activity-level options 1:1 onto the backend enum", () => {
    expect(ACTIVITY_LEVEL_OPTIONS.map((option) => option.value)).toEqual([
      "sedentary",
      "lightly_active",
      "moderately_active",
      "very_active",
      "extremely_active",
    ]);
  });

  it("requires target weight only for lose/gain goals", () => {
    expect(needsTargetWeight("lose_weight")).toBe(true);
    expect(needsTargetWeight("gain_muscle")).toBe(true);
    expect(needsTargetWeight("maintain_weight")).toBe(false);
    expect(needsTargetWeight("improve_endurance")).toBe(false);
    expect(needsTargetWeight("general_fitness")).toBe(false);
    expect(needsTargetWeight(null)).toBe(false);
  });

  it("rejects invalid and non-positive height and weight", () => {
    const height = validateAthleteSetupStep(
      completeValues({ heightCm: "-1" }),
      ATHLETE_SETUP_STEPS.BODY,
    );
    expect(height.isValid).toBe(false);
    expect(height.errors.heightCm).toMatch(/greater than 0/i);

    const weight = validateAthleteSetupStep(
      completeValues({ weightKg: "0" }),
      ATHLETE_SETUP_STEPS.BODY,
    );
    expect(weight.isValid).toBe(false);

    const garbage = validateAthleteSetupStep(
      completeValues({ heightCm: "abc" }),
      ATHLETE_SETUP_STEPS.BODY,
    );
    expect(garbage.isValid).toBe(false);
  });

  it("requires birth date and gender before leaving identity", () => {
    const result = validateAthleteSetupStep(
      createEmptyAthleteSetupValues(),
      ATHLETE_SETUP_STEPS.IDENTITY,
    );
    expect(result.errors.firstName).toBeTruthy();
    expect(result.errors.birthDate).toBeTruthy();
    expect(result.errors.gender).toBeTruthy();
  });

  it("requires target weight when the goal is a cut or build", () => {
    const missing = validateAthleteSetup(
      completeValues({ goal: "lose_weight", targetWeightKg: "" }),
    );
    expect(missing.isValid).toBe(false);
    expect(missing.errors.targetWeightKg).toBeTruthy();

    const ok = validateAthleteSetup(
      completeValues({ goal: "lose_weight", targetWeightKg: "58" }),
    );
    expect(ok.isValid).toBe(true);
  });

  it("omits target_weight_kg unless the goal needs it", () => {
    const maintain = mapSetupToUserUpdate(completeValues({ goal: "maintain_weight", targetWeightKg: "70" }));
    expect(maintain.target_weight_kg).toBeUndefined();
    expect(maintain.activity_level).toBe("moderately_active");
    expect(maintain.goal).toBe("maintain_weight");

    const cut = mapSetupToUserUpdate(
      completeValues({ goal: "lose_weight", targetWeightKg: "58" }),
    );
    expect(cut.target_weight_kg).toBe(58);
  });

  it("treats a backend user as complete without a tracked Goal row", () => {
    expect(isBackendProfileComplete(completeUser())).toBe(true);
    expect(isBackendProfileComplete(completeUser({ first_name: null }))).toBe(false);
    expect(
      isBackendProfileComplete(completeUser({ goal: "lose_weight", target_weight_kg: null })),
    ).toBe(false);
    expect(
      isBackendProfileComplete(
        completeUser({
          goal: "lose_weight",
          target_weight_kg: "58.00" as unknown as number,
        }),
      ),
    ).toBe(true);
  });

  it("treats a merged athlete profile as complete from backend fields, not goals[]", () => {
    expect(
      isAthleteSetupComplete({
        firstName: "Jordan",
        birthDate: "1994-02-10",
        gender: "female",
        heightCm: 170,
        weightKg: 62,
        primaryGoal: "general_fitness",
        activityLevel: "moderately_active",
        targetWeightKg: null,
      }),
    ).toBe(true);
  });
});
