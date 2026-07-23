export type NutritionReasoningTopic =
  | "goal"
  | "calories"
  | "macros"
  | "protein"
  | "carbohydrate"
  | "fat"
  | "fiber"
  | "meal_timing"
  | "body_composition"
  | "energy_balance"
  | "hydration"
  | "supplements"
  | "adherence"
  | "education";

export const NutritionReasoningTopics = Object.freeze({
  GOAL: "goal" as const,
  CALORIES: "calories" as const,
  MACROS: "macros" as const,
  PROTEIN: "protein" as const,
  CARBOHYDRATE: "carbohydrate" as const,
  FAT: "fat" as const,
  FIBER: "fiber" as const,
  MEAL_TIMING: "meal_timing" as const,
  BODY_COMPOSITION: "body_composition" as const,
  ENERGY_BALANCE: "energy_balance" as const,
  HYDRATION: "hydration" as const,
  SUPPLEMENTS: "supplements" as const,
  ADHERENCE: "adherence" as const,
  EDUCATION: "education" as const,
});

/**
 * Immutable deterministic reasoning artifact.
 */
export interface NutritionReasoning {
  readonly id: string;
  readonly topic: NutritionReasoningTopic;
  readonly findings: readonly string[];
  readonly signals: Readonly<Record<string, number>>;
  readonly notes: readonly string[];
}
