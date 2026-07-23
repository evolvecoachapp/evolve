import type { NutritionConfidence } from "./NutritionConfidence";

export type NutritionRecommendationCategory =
  | "calories"
  | "macros"
  | "meals"
  | "hydration"
  | "supplements"
  | "adherence"
  | "education"
  | "safety";

export const NutritionRecommendationCategories = Object.freeze({
  CALORIES: "calories" as const,
  MACROS: "macros" as const,
  MEALS: "meals" as const,
  HYDRATION: "hydration" as const,
  SUPPLEMENTS: "supplements" as const,
  ADHERENCE: "adherence" as const,
  EDUCATION: "education" as const,
  SAFETY: "safety" as const,
});

/**
 * Immutable nutrition recommendation.
 */
export interface NutritionRecommendation {
  readonly id: string;
  readonly category: NutritionRecommendationCategory;
  readonly title: string;
  readonly detail: string;
  readonly priority: number;
  readonly confidence: NutritionConfidence;
  readonly relatedPlanId: string | null;
}
