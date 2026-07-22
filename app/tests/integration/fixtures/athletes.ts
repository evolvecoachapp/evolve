import { createAthleteProfile } from "../../../src/features/athlete-context/testSupport/fixtures";
import type { AthleteContext } from "../../../src/features/program-generation/models/WorkoutGenerationRequest";
import { INTEGRATION_FIXED_TIMESTAMP } from "../shared/constants";
import type { AthleteFixture } from "../shared/types";

function freezeAthleteContext(
  profileOverrides: Parameters<typeof createAthleteProfile>[0],
  trainingAgeYears?: number | null,
): AthleteContext {
  const profile = createAthleteProfile(profileOverrides);
  return Object.freeze({
    profile,
    trainingAgeYears:
      trainingAgeYears !== undefined
        ? trainingAgeYears
        : profile.experience.yearsTraining,
    validation: Object.freeze({
      valid: true,
      issues: Object.freeze([] as const),
    }),
    capturedAt: INTEGRATION_FIXED_TIMESTAMP,
  });
}

function createFixture(
  key: string,
  label: string,
  athleteContext: AthleteContext,
): AthleteFixture {
  return Object.freeze({ key, label, athleteContext });
}

/** Beginner athlete focused on bodybuilding / hypertrophy. */
export const BeginnerBodybuildingAthlete = createFixture(
  "beginner-bodybuilding",
  "Beginner Bodybuilding Athlete",
  freezeAthleteContext({
    id: "athlete-beginner-bb",
    displayName: "Beginner Bodybuilding Athlete",
    ageYears: 22,
    heightCm: 175,
    weightKg: 70,
    goal: { primary: "bodybuilding", secondary: "hypertrophy", targetDate: null },
    experience: {
      level: "beginner",
      trainingStartedAt: "2025-01-01T00:00:00.000Z",
      yearsTraining: 1,
    },
    availability: {
      daysPerWeek: 3,
      sessionDurationMinutes: 45,
      preferredDays: [1, 3, 5],
    },
    preference: {
      preferredSplit: "full_body",
      prefersCompoundLifts: true,
      intensityBias: "low",
    },
    equipment: {
      available: ["barbell", "dumbbell", "cable", "machine", "bodyweight"],
      hasFullGymAccess: true,
    },
  }),
);

/** Advanced powerlifting-focused athlete. */
export const AdvancedPowerliftingAthlete = createFixture(
  "advanced-powerlifting",
  "Advanced Powerlifting Athlete",
  freezeAthleteContext({
    id: "athlete-advanced-pl",
    displayName: "Advanced Powerlifting Athlete",
    ageYears: 32,
    heightCm: 180,
    weightKg: 95,
    goal: { primary: "powerlifting", secondary: "strength", targetDate: null },
    experience: {
      level: "advanced",
      trainingStartedAt: "2016-03-01T00:00:00.000Z",
      yearsTraining: 10,
    },
    availability: {
      daysPerWeek: 4,
      sessionDurationMinutes: 90,
      preferredDays: [1, 2, 4, 5],
    },
    preference: {
      preferredSplit: "upper_lower",
      prefersCompoundLifts: true,
      intensityBias: "high",
    },
    equipment: {
      available: [
        "barbell",
        "dumbbell",
        "cable",
        "machine",
        "smith_machine",
        "specialty_bar",
        "bodyweight",
      ],
      hasFullGymAccess: true,
    },
  }),
);

/** Intermediate powerbuilding athlete (strength + hypertrophy). */
export const IntermediatePowerbuildingAthlete = createFixture(
  "intermediate-powerbuilding",
  "Intermediate Powerbuilding Athlete",
  freezeAthleteContext({
    id: "athlete-intermediate-pb",
    displayName: "Intermediate Powerbuilding Athlete",
    ageYears: 27,
    heightCm: 178,
    weightKg: 82,
    goal: { primary: "strength", secondary: "hypertrophy", targetDate: null },
    experience: {
      level: "intermediate",
      trainingStartedAt: "2020-06-01T00:00:00.000Z",
      yearsTraining: 5,
    },
    availability: {
      daysPerWeek: 4,
      sessionDurationMinutes: 75,
      preferredDays: [1, 2, 4, 5],
    },
    preference: {
      preferredSplit: "upper_lower",
      prefersCompoundLifts: true,
      intensityBias: "moderate",
    },
    equipment: {
      available: ["barbell", "dumbbell", "cable", "machine", "bodyweight"],
      hasFullGymAccess: true,
    },
  }),
);

/** Home-gym athlete with limited equipment. */
export const HomeGymAthlete = createFixture(
  "home-gym",
  "Home Gym Athlete",
  freezeAthleteContext({
    id: "athlete-home-gym",
    displayName: "Home Gym Athlete",
    ageYears: 30,
    heightCm: 172,
    weightKg: 75,
    goal: { primary: "general_fitness", secondary: "hypertrophy", targetDate: null },
    experience: {
      level: "intermediate",
      trainingStartedAt: "2021-01-01T00:00:00.000Z",
      yearsTraining: 4,
    },
    availability: {
      daysPerWeek: 3,
      sessionDurationMinutes: 50,
      preferredDays: [2, 4, 6],
    },
    preference: {
      preferredSplit: "full_body",
      prefersCompoundLifts: true,
      intensityBias: "moderate",
    },
    equipment: {
      available: ["dumbbell", "kettlebell", "resistance_band", "bodyweight"],
      hasFullGymAccess: false,
    },
  }),
);

/** Strength-primary athlete. */
export const StrengthFocusedAthlete = createFixture(
  "strength-focused",
  "Strength Focused Athlete",
  freezeAthleteContext({
    id: "athlete-strength",
    displayName: "Strength Focused Athlete",
    ageYears: 29,
    heightCm: 183,
    weightKg: 90,
    goal: { primary: "strength", secondary: null, targetDate: null },
    experience: {
      level: "intermediate",
      trainingStartedAt: "2019-09-01T00:00:00.000Z",
      yearsTraining: 6,
    },
    availability: {
      daysPerWeek: 4,
      sessionDurationMinutes: 70,
      preferredDays: [1, 3, 5, 6],
    },
    preference: {
      preferredSplit: "upper_lower",
      prefersCompoundLifts: true,
      intensityBias: "high",
    },
    equipment: {
      available: ["barbell", "dumbbell", "cable", "machine", "bodyweight"],
      hasFullGymAccess: true,
    },
  }),
);

/** Hypertrophy-primary athlete. */
export const HypertrophyFocusedAthlete = createFixture(
  "hypertrophy-focused",
  "Hypertrophy Focused Athlete",
  freezeAthleteContext({
    id: "athlete-hypertrophy",
    displayName: "Hypertrophy Focused Athlete",
    ageYears: 26,
    heightCm: 176,
    weightKg: 78,
    goal: { primary: "hypertrophy", secondary: "bodybuilding", targetDate: null },
    experience: {
      level: "intermediate",
      trainingStartedAt: "2021-04-01T00:00:00.000Z",
      yearsTraining: 4,
    },
    availability: {
      daysPerWeek: 5,
      sessionDurationMinutes: 60,
      preferredDays: [1, 2, 3, 5, 6],
    },
    preference: {
      preferredSplit: "push_pull_legs",
      prefersCompoundLifts: true,
      intensityBias: "moderate",
    },
    equipment: {
      available: ["barbell", "dumbbell", "cable", "machine", "bodyweight"],
      hasFullGymAccess: true,
    },
  }),
);

/** Fat-loss / cutting phase athlete. */
export const CuttingAthlete = createFixture(
  "cutting",
  "Cutting Athlete",
  freezeAthleteContext({
    id: "athlete-cutting",
    displayName: "Cutting Athlete",
    ageYears: 28,
    heightCm: 174,
    weightKg: 72,
    goal: { primary: "fat_loss", secondary: "hypertrophy", targetDate: null },
    experience: {
      level: "intermediate",
      trainingStartedAt: "2020-01-01T00:00:00.000Z",
      yearsTraining: 5,
    },
    availability: {
      daysPerWeek: 4,
      sessionDurationMinutes: 55,
      preferredDays: [1, 2, 4, 5],
    },
    preference: {
      preferredSplit: "upper_lower",
      prefersCompoundLifts: true,
      intensityBias: "moderate",
    },
    equipment: {
      available: ["barbell", "dumbbell", "cable", "machine", "bodyweight"],
      hasFullGymAccess: true,
    },
  }),
);

/** Surplus / bulking phase athlete. */
export const BulkingAthlete = createFixture(
  "bulking",
  "Bulking Athlete",
  freezeAthleteContext({
    id: "athlete-bulking",
    displayName: "Bulking Athlete",
    ageYears: 24,
    heightCm: 181,
    weightKg: 85,
    goal: { primary: "hypertrophy", secondary: "strength", targetDate: null },
    experience: {
      level: "intermediate",
      trainingStartedAt: "2021-08-01T00:00:00.000Z",
      yearsTraining: 4,
    },
    availability: {
      daysPerWeek: 5,
      sessionDurationMinutes: 75,
      preferredDays: [1, 2, 3, 5, 6],
    },
    preference: {
      preferredSplit: "push_pull_legs",
      prefersCompoundLifts: true,
      intensityBias: "high",
    },
    equipment: {
      available: ["barbell", "dumbbell", "cable", "machine", "bodyweight"],
      hasFullGymAccess: true,
    },
  }),
);

/** Female strength athlete. */
export const FemaleStrengthAthlete = createFixture(
  "female-strength",
  "Female Strength Athlete",
  freezeAthleteContext({
    id: "athlete-female-strength",
    displayName: "Female Strength Athlete",
    ageYears: 31,
    heightCm: 165,
    weightKg: 62,
    goal: { primary: "strength", secondary: "powerlifting", targetDate: null },
    experience: {
      level: "advanced",
      trainingStartedAt: "2017-05-01T00:00:00.000Z",
      yearsTraining: 8,
    },
    availability: {
      daysPerWeek: 4,
      sessionDurationMinutes: 70,
      preferredDays: [1, 3, 5, 6],
    },
    preference: {
      preferredSplit: "upper_lower",
      prefersCompoundLifts: true,
      intensityBias: "high",
    },
    equipment: {
      available: ["barbell", "dumbbell", "cable", "machine", "bodyweight"],
      hasFullGymAccess: true,
    },
  }),
);

/** General fitness athlete. */
export const GeneralFitnessAthlete = createFixture(
  "general-fitness",
  "General Fitness Athlete",
  freezeAthleteContext({
    id: "athlete-general-fitness",
    displayName: "General Fitness Athlete",
    ageYears: 35,
    heightCm: 170,
    weightKg: 74,
    goal: { primary: "general_fitness", secondary: "endurance", targetDate: null },
    experience: {
      level: "beginner",
      trainingStartedAt: "2024-06-01T00:00:00.000Z",
      yearsTraining: 2,
    },
    availability: {
      daysPerWeek: 3,
      sessionDurationMinutes: 40,
      preferredDays: [1, 3, 5],
    },
    preference: {
      preferredSplit: "full_body",
      prefersCompoundLifts: true,
      intensityBias: "low",
    },
    equipment: {
      available: ["dumbbell", "cable", "machine", "bodyweight"],
      hasFullGymAccess: true,
    },
  }),
);

/** Registry of all immutable athlete fixtures. */
export const ATHLETE_FIXTURES = Object.freeze({
  BeginnerBodybuildingAthlete,
  AdvancedPowerliftingAthlete,
  IntermediatePowerbuildingAthlete,
  HomeGymAthlete,
  StrengthFocusedAthlete,
  HypertrophyFocusedAthlete,
  CuttingAthlete,
  BulkingAthlete,
  FemaleStrengthAthlete,
  GeneralFitnessAthlete,
} as const);

export type AthleteFixtureName = keyof typeof ATHLETE_FIXTURES;

export function getAthleteFixture(name: AthleteFixtureName): AthleteFixture {
  return ATHLETE_FIXTURES[name];
}

export function listAthleteFixtures(): readonly AthleteFixture[] {
  return Object.freeze(Object.values(ATHLETE_FIXTURES));
}
