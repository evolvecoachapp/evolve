import type { GoalMetadata } from "./GoalMetadata";

/** Immutable ordinal velocity marker — no prediction. */
export interface GoalVelocity {
  readonly id: string;
  readonly goalId: string;
  readonly ordinal: number;
  readonly directionKey: string;
  readonly signalKeys: readonly string[];
  readonly metadata: GoalMetadata;
  readonly createdAt: string;
}
