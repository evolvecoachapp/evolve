import type { GoalMetadata } from "./GoalMetadata";

/** Immutable projection marker from historical keys only — no forecasting. */
export interface GoalProjection {
  readonly id: string;
  readonly goalId: string;
  readonly horizonKey: string;
  readonly checkpointKeys: readonly string[];
  readonly signalKeys: readonly string[];
  readonly metadata: GoalMetadata;
  readonly createdAt: string;
}
