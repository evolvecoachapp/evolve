export interface DailyProtein {
  readonly currentGrams: number;
  readonly targetGrams: number;
  readonly remainingGrams: number;
  readonly completionPercent: number;
}

export function createDailyProtein(input: DailyProtein): DailyProtein {
  return Object.freeze({ ...input });
}
