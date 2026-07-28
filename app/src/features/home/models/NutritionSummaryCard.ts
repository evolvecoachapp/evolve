/** Immutable macro target display values for Home nutrition. */
export interface NutritionMacroCard {
  readonly current: number;
  readonly target: number;
  readonly progressPercent: number;
  readonly unitLabel: string;
}

/** Immutable nutrition summary for Home. */
export interface NutritionSummaryCard {
  readonly present: boolean;
  readonly calories: NutritionMacroCard;
  readonly protein: NutritionMacroCard;
  readonly carbs: NutritionMacroCard;
  readonly fat: NutritionMacroCard;
  readonly destination: string;
}
