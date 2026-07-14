export type Gender = "male" | "female" | "other" | "prefer_not_to_say";

export type ActivityLevel =
  | "sedentary"
  | "lightly_active"
  | "moderately_active"
  | "very_active"
  | "extremely_active";

export type FitnessGoal =
  | "lose_weight"
  | "maintain_weight"
  | "gain_muscle"
  | "improve_endurance"
  | "general_fitness";

/** Extended profile and biometrics used by coaching and personalization engines. */
export interface UserProfile {
  userId: string;
  firstName: string | null;
  lastName: string | null;
  displayName: string | null;
  avatarUrl: string | null;
  birthDate: string | null;
  gender: Gender | null;
  heightCm: number | null;
  currentWeightKg: number | null;
  targetWeightKg: number | null;
  activityLevel: ActivityLevel | null;
  goal: FitnessGoal | null;
  updatedAt: string;
}
