export interface DailyCalories {
  readonly current: number;
  readonly target: number;
  readonly remaining: number;
  readonly completionPercent: number;
}

export function createDailyCalories(input: DailyCalories): DailyCalories {
  return Object.freeze({ ...input });
}
