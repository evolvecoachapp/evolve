export interface DailyCarbohydrates {
  readonly currentGrams: number;
  readonly targetGrams: number;
  readonly remainingGrams: number;
  readonly completionPercent: number;
}

export function createDailyCarbohydrates(input: DailyCarbohydrates): DailyCarbohydrates {
  return Object.freeze({ ...input });
}
