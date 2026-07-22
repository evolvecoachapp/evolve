import type { DecisionReport } from "../../../core/decision-intelligence/models/DecisionReport";
import type { EventStream } from "../../../core/domain-events/models/EventStream";
import type { WorkoutResult } from "../../workout-runtime/models/WorkoutResult";

/**
 * Inputs for single-session performance analysis.
 * DecisionReport is optional reference metadata only.
 */
export interface PerformanceAnalysisInput {
  readonly workoutResult: WorkoutResult;
  readonly eventStream: EventStream;
  readonly decisionReport?: DecisionReport | null;
  /** ISO timestamp override for deterministic tests. */
  readonly analyzedAt?: string;
  readonly snapshotId?: string;
}
