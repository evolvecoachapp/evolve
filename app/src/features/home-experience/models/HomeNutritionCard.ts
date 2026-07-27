/**
 * Immutable Home nutrition card — composed from Nutrition Pipeline outputs.
 * Presentation only. Never invent macros.
 */
export interface HomeNutritionMacros {
  readonly calories: number;
  readonly proteinG: number;
  readonly carbsG: number;
  readonly fatG: number;
}

export interface HomeNutritionCard {
  readonly present: boolean;
  readonly planId: string | null;
  readonly macros: HomeNutritionMacros | null;
  readonly phaseHint: string | null;
  readonly latestChangeSummary: string | null;
  readonly summary: string;
}
