import type { GoalMetadata } from "./GoalMetadata";

/**
 * Handoff input only — does NOT modify goals.
 */
export interface ContinuousAdaptationInput {
  readonly id: string;
  readonly athleteId: string;
  readonly contextId: string;
  readonly decisionIds: readonly string[];
  readonly signalKeys: readonly string[];
  readonly categoryKeys: readonly string[];
  readonly metadata: GoalMetadata;
  readonly createdAt: string;
}
