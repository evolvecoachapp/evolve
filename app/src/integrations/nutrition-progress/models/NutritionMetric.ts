/** Immutable nutrition metric representation — no calculations. */
export interface NutritionMetric {
  readonly key: string;
  readonly label: string;
  readonly value: number;
  readonly unit: string;
}

export function createNutritionMetric(input: NutritionMetric): NutritionMetric {
  return Object.freeze({ ...input });
}
