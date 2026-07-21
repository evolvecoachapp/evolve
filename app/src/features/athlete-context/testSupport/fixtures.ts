import type { AthleteProfile } from "../models/AthleteProfile";
import type { AthleteGoal } from "../models/AthleteGoal";
import type {
  EquipmentItem,
  EquipmentProfile,
} from "../models/EquipmentProfile";
import type { InjuryEntry, InjuryProfile } from "../models/InjuryProfile";
import type { TrainingAvailability } from "../models/TrainingAvailability";
import type { TrainingExperience } from "../models/TrainingExperience";
import type { TrainingPreference } from "../models/TrainingPreference";

const DEFAULT_EQUIPMENT: readonly EquipmentItem[] = Object.freeze([
  "barbell",
  "dumbbell",
  "cable",
  "bodyweight",
]);

export const FIXED_TIMESTAMP = "2026-07-22T00:00:00.000Z";

export interface CreateAthleteProfileOverrides {
  readonly id?: string;
  readonly displayName?: string | null;
  readonly ageYears?: number | null;
  readonly heightCm?: number | null;
  readonly weightKg?: number | null;
  readonly goal?: Partial<AthleteGoal>;
  readonly experience?: Partial<TrainingExperience>;
  readonly availability?: Partial<TrainingAvailability>;
  readonly preference?: Partial<TrainingPreference>;
  readonly equipment?: Partial<EquipmentProfile>;
  readonly injuries?: Partial<InjuryProfile>;
  readonly createdAt?: string;
  readonly updatedAt?: string;
}

/**
 * Deterministic athlete profile for tests and in-memory defaults.
 */
export function createAthleteProfile(
  overrides: CreateAthleteProfileOverrides = {},
): AthleteProfile {
  return Object.freeze({
    id: overrides.id ?? "athlete-1",
    displayName:
      overrides.displayName !== undefined
        ? overrides.displayName
        : "Test Athlete",
    ageYears: overrides.ageYears !== undefined ? overrides.ageYears : 28,
    heightCm: overrides.heightCm !== undefined ? overrides.heightCm : 178,
    weightKg: overrides.weightKg !== undefined ? overrides.weightKg : 80,
    goal: Object.freeze({
      primary: overrides.goal?.primary ?? "hypertrophy",
      secondary:
        overrides.goal?.secondary !== undefined
          ? overrides.goal.secondary
          : "strength",
      targetDate:
        overrides.goal?.targetDate !== undefined
          ? overrides.goal.targetDate
          : null,
    }),
    experience: Object.freeze({
      level: overrides.experience?.level ?? "intermediate",
      trainingStartedAt:
        overrides.experience?.trainingStartedAt !== undefined
          ? overrides.experience.trainingStartedAt
          : "2022-01-15T00:00:00.000Z",
      yearsTraining:
        overrides.experience?.yearsTraining !== undefined
          ? overrides.experience.yearsTraining
          : 4,
    }),
    availability: Object.freeze({
      daysPerWeek: overrides.availability?.daysPerWeek ?? 4,
      sessionDurationMinutes:
        overrides.availability?.sessionDurationMinutes ?? 60,
      preferredDays: Object.freeze(
        overrides.availability?.preferredDays ?? [1, 2, 4, 5],
      ),
    }),
    preference: Object.freeze({
      preferredSplit:
        overrides.preference?.preferredSplit !== undefined
          ? overrides.preference.preferredSplit
          : "upper_lower",
      prefersCompoundLifts:
        overrides.preference?.prefersCompoundLifts ?? true,
      intensityBias: overrides.preference?.intensityBias ?? "moderate",
    }),
    equipment: Object.freeze({
      available: Object.freeze(
        (overrides.equipment?.available ?? DEFAULT_EQUIPMENT).slice(),
      ) as readonly EquipmentItem[],
      hasFullGymAccess: overrides.equipment?.hasFullGymAccess ?? true,
    }),
    injuries: Object.freeze({
      injuries: Object.freeze(
        (overrides.injuries?.injuries ?? []).slice(),
      ) as readonly InjuryEntry[],
    }),
    createdAt: overrides.createdAt ?? FIXED_TIMESTAMP,
    updatedAt: overrides.updatedAt ?? FIXED_TIMESTAMP,
  });
}
