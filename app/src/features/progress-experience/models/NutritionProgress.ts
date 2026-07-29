import type { ChartSeries } from "./ChartModel";

export interface NutritionProgress {
  readonly caloriesAdherencePercent: number;
  readonly proteinAdherencePercent: number;
  readonly averageCalories: number;
  readonly averageProteinGrams: number;
  readonly chart: ChartSeries;
  readonly destination: string | null;
}

export function createNutritionProgress(input: NutritionProgress): NutritionProgress {
  return Object.freeze({ ...input });
}
