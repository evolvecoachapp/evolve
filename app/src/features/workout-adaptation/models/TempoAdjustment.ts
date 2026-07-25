import type { WorkoutMetadata } from "./WorkoutMetadata";

export interface TempoAdjustment {
  readonly id: string;
  readonly tempoKey: string;
  readonly targetKey: string;
  readonly sourceDecisionKeys: readonly string[];
  readonly planStepKeys: readonly string[];
  readonly metadata: WorkoutMetadata;
  readonly createdAt: string;
}
