import type { ProgressChart } from "./ProgressChart";

export interface TrainingConsistency {
  readonly currentStreakDays: number;
  readonly bestStreakDays: number;
  readonly adherencePercent: number;
  readonly completedSessions: number;
  readonly plannedSessions: number;
  readonly chart: ProgressChart | null;
  readonly destination: string | null;
}

export function createTrainingConsistency(input: TrainingConsistency): TrainingConsistency {
  return Object.freeze({ ...input });
}
