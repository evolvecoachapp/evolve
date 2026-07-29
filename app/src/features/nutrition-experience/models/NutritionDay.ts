export interface NutritionDay {
  readonly id: string;
  readonly isoDate: string;
  readonly label: string;
  readonly shortLabel: string;
  readonly relativeLabel: string;
  readonly isToday: boolean;
}

export function createNutritionDay(input: NutritionDay): NutritionDay {
  return Object.freeze({ ...input });
}
