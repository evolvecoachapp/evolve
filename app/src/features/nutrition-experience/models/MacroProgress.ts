import type { DailyCalories } from "./DailyCalories";
import type { DailyCarbohydrates } from "./DailyCarbohydrates";
import type { DailyFat } from "./DailyFat";
import type { DailyProtein } from "./DailyProtein";

export interface MacroProgress {
  readonly calories: DailyCalories;
  readonly protein: DailyProtein;
  readonly carbohydrates: DailyCarbohydrates;
  readonly fat: DailyFat;
  readonly score: number;
}

export function createMacroProgress(input: MacroProgress): MacroProgress {
  return Object.freeze({ ...input });
}
