export type MacroNutrient = "calories" | "protein" | "carbs" | "fat";

/** Nutrition logging and dashboard display preferences. */
export interface NutritionPreferences {
  macroDisplayOrder: MacroNutrient[];
  showMicronutrients: boolean;
  waterTrackingEnabled: boolean;
  dailyWaterTargetMl: number;
  mealReminderEnabled: boolean;
  barcodeScannerEnabled: boolean;
  defaultMealCount: number;
}
