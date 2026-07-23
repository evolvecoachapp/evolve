import type { AIExecutionErrorSnapshot } from "./AIExecutionError";
import type { AIExecutionStage } from "./AIExecutionStage";
import type { AIExecutionStatus } from "./AIExecutionStatus";

/**
 * Immutable snapshot of pipeline execution state.
 */
export interface AIExecutionState {
  readonly status: AIExecutionStatus;
  readonly stage: AIExecutionStage | null;
  readonly startedAt: string | null;
  readonly completedAt: string | null;
  readonly error: AIExecutionErrorSnapshot | null;
}

export const INITIAL_EXECUTION_STATE: AIExecutionState = Object.freeze({
  status: "pending",
  stage: null,
  startedAt: null,
  completedAt: null,
  error: null,
});
