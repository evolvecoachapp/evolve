export interface DailyFat {
  readonly currentGrams: number;
  readonly targetGrams: number;
  readonly remainingGrams: number;
  readonly completionPercent: number;
}

export function createDailyFat(input: DailyFat): DailyFat {
  return Object.freeze({ ...input });
}
