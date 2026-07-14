export interface NutritionTrendPoint {
  date: string;
  calories: number;
  proteinGrams: number;
  adherencePercent: number;
}

/** Nutrition adherence trend over time. */
export interface NutritionTrend {
  points: NutritionTrendPoint[];
  avgAdherencePercent: number;
}
