import type { WorkoutMetadata } from "./WorkoutMetadata";

export interface SessionAdjustment {
  readonly id: string;
  readonly sessionKey: string;
  readonly targetKey: string;
  readonly sourceDecisionKeys: readonly string[];
  readonly planStepKeys: readonly string[];
  readonly metadata: WorkoutMetadata;
  readonly createdAt: string;
}
