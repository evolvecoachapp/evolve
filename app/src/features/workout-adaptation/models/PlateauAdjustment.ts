import type { WorkoutMetadata } from "./WorkoutMetadata";

export interface PlateauAdjustment {
  readonly id: string;
  readonly plateauKey: string;
  readonly targetKey: string;
  readonly sourceDecisionKeys: readonly string[];
  readonly planStepKeys: readonly string[];
  readonly metadata: WorkoutMetadata;
  readonly createdAt: string;
}
