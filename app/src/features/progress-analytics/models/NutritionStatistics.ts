import type { ProgressChart } from "./ProgressChart";

export interface NutritionStatistics {
  readonly averageCalories: number;
  readonly averageProteinGrams: number;
  readonly averageCarbohydrateGrams: number;
  readonly averageFatGrams: number;
  readonly calorieAdherencePercent: number;
  readonly proteinAdherencePercent: number;
  readonly chart: ProgressChart | null;
  readonly destination: string | null;
}

export function createNutritionStatistics(input: NutritionStatistics): NutritionStatistics {
  return Object.freeze({ ...input });
}
