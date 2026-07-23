import type { AIExecutionEvent } from "./AIExecutionEvent";
import type { AIExecutionStage } from "./AIExecutionStage";
import type { AIExecutionStatus } from "./AIExecutionStatus";

/**
 * Immutable lifecycle record for a pipeline run.
 */
export interface AIExecutionLifecycle {
  readonly status: AIExecutionStatus;
  readonly currentStage: AIExecutionStage | null;
  readonly completedStages: readonly AIExecutionStage[];
  readonly events: readonly AIExecutionEvent[];
  readonly startedAt: string | null;
  readonly completedAt: string | null;
}

export const EMPTY_LIFECYCLE: AIExecutionLifecycle = Object.freeze({
  status: "pending",
  currentStage: null,
  completedStages: Object.freeze([] as AIExecutionStage[]),
  events: Object.freeze([] as AIExecutionEvent[]),
  startedAt: null,
  completedAt: null,
});
