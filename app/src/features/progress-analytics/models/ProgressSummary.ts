export interface ProgressSummary {
  readonly headline: string;
  readonly summary: string;
  readonly workoutsCompleted: number;
  readonly adherencePercent: number;
  readonly strengthChangePercent: number;
  readonly bodyWeightChangeKg: number;
  readonly recoveryScore: number;
  readonly consistencyPercent: number;
}

export function createProgressSummary(input: ProgressSummary): ProgressSummary {
  return Object.freeze({ ...input });
}
