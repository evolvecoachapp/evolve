import type { NutritionAgentMetadata } from "./NutritionMetadata";
import type { NutritionIntent } from "./NutritionIntent";
import type { NutritionGoal } from "./NutritionGoal";
import type { NutritionPreferences } from "./NutritionPreferences";

/**
 * Immutable inbound request for the Nutrition Agent.
 */
export interface NutritionRequest {
  readonly id: string;
  readonly athleteId: string | null;
  readonly conversationId: string | null;
  readonly message: string;
  readonly intentHint: NutritionIntent | null;
  readonly goalHint: NutritionGoal | null;
  readonly bodyWeightKg: number | null;
  readonly activityLevel: NutritionActivityLevel | null;
  readonly constraints: readonly string[];
  readonly preferences: NutritionPreferences | null;
  readonly metadata: NutritionAgentMetadata;
  readonly createdAt: string;
}

export type NutritionActivityLevel =
  | "sedentary"
  | "light"
  | "moderate"
  | "active"
  | "very_active";

export const NutritionActivityLevels = Object.freeze({
  SEDENTARY: "sedentary" as const,
  LIGHT: "light" as const,
  MODERATE: "moderate" as const,
  ACTIVE: "active" as const,
  VERY_ACTIVE: "very_active" as const,
});
