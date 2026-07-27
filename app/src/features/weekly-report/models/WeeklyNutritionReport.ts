/**
 * Immutable Weekly Coach Report nutrition section.
 * Composed from Nutrition Pipeline — weekly adherence, macro changes, calories, compliance.
 * Presentation only. Never invent macros.
 */
export interface WeeklyNutritionMacros {
  readonly calories: number;
  readonly proteinG: number;
  readonly carbsG: number;
  readonly fatG: number;
}

export interface WeeklyNutritionReport {
  readonly present: boolean;
  readonly planId: string | null;
  readonly macros: WeeklyNutritionMacros | null;
  readonly phaseHint: string | null;
  readonly macroChangeCount: number;
  readonly latestChangeSummary: string | null;
  readonly adherenceSummary: string | null;
  readonly complianceSummary: string | null;
  readonly summary: string;
}
