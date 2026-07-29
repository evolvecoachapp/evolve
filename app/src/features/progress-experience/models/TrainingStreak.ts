export interface TrainingStreak {
  readonly currentDays: number;
  readonly bestDays: number;
  readonly completedWeeks: number;
  readonly destination: string | null;
}

export function createTrainingStreak(input: TrainingStreak): TrainingStreak {
  return Object.freeze({ ...input });
}
