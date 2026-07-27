/**
 * Immutable Daily Brief nutrition section — composed from Nutrition Pipeline.
 * Presentation only. Never invent macros.
 */
export interface DailyBriefNutritionMacros {
  readonly calories: number;
  readonly proteinG: number;
  readonly carbsG: number;
  readonly fatG: number;
}

export interface DailyBriefNutrition {
  readonly present: boolean;
  readonly planId: string | null;
  readonly macros: DailyBriefNutritionMacros | null;
  readonly phaseHint: string | null;
  readonly latestChangeSummary: string | null;
  readonly summary: string;
}
