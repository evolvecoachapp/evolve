/**
 * Immutable confidence score for Nutrition Agent decisions.
 */
export interface NutritionConfidence {
  readonly score: number;
  readonly label: NutritionConfidenceLabel;
  readonly rationale: string | null;
}

export type NutritionConfidenceLabel =
  | "very_low"
  | "low"
  | "medium"
  | "high"
  | "very_high";

export const NutritionConfidenceLabels = Object.freeze({
  VERY_LOW: "very_low" as const,
  LOW: "low" as const,
  MEDIUM: "medium" as const,
  HIGH: "high" as const,
  VERY_HIGH: "very_high" as const,
});

export function labelFromScore(score: number): NutritionConfidenceLabel {
  if (score < 0.2) return NutritionConfidenceLabels.VERY_LOW;
  if (score < 0.4) return NutritionConfidenceLabels.LOW;
  if (score < 0.6) return NutritionConfidenceLabels.MEDIUM;
  if (score < 0.8) return NutritionConfidenceLabels.HIGH;
  return NutritionConfidenceLabels.VERY_HIGH;
}
