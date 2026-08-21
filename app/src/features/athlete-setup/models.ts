import type { ActivityLevel, Gender, Goal } from "../../types/api";

export const ATHLETE_SETUP_STEPS = {
  IDENTITY: 0,
  BODY: 1,
  INTENT: 2,
} as const;

export type AthleteSetupStep =
  (typeof ATHLETE_SETUP_STEPS)[keyof typeof ATHLETE_SETUP_STEPS];

export const ATHLETE_SETUP_STEP_COUNT = 3;

export const GOALS_REQUIRING_TARGET_WEIGHT: readonly Goal[] = [
  "lose_weight",
  "gain_muscle",
];

export interface AthleteSetupValues {
  firstName: string;
  birthDate: string;
  gender: Gender | null;
  heightCm: string;
  weightKg: string;
  goal: Goal | null;
  activityLevel: ActivityLevel | null;
  targetWeightKg: string;
}

export type AthleteSetupField = keyof AthleteSetupValues;

export type AthleteSetupErrors = Partial<Record<AthleteSetupField, string>>;

export function createEmptyAthleteSetupValues(): AthleteSetupValues {
  return {
    firstName: "",
    birthDate: "",
    gender: null,
    heightCm: "",
    weightKg: "",
    goal: null,
    activityLevel: null,
    targetWeightKg: "",
  };
}

export function needsTargetWeight(goal: Goal | null): boolean {
  return goal != null && GOALS_REQUIRING_TARGET_WEIGHT.includes(goal);
}
