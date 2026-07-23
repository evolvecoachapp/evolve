import type { AIExecutionStage } from "./AIExecutionStage";
import type { AIExecutionStatus } from "./AIExecutionStatus";

/**
 * Immutable record of a single stage execution.
 */
export interface AIExecutionTraceStep {
  readonly stage: AIExecutionStage;
  readonly status: AIExecutionStatus;
  readonly startedAt: string;
  readonly completedAt: string | null;
  readonly durationMs: number | null;
  readonly validationIssues: readonly string[];
  readonly message: string | null;
}

/**
 * Ordered immutable pipeline execution trace.
 */
export interface AIExecutionTrace {
  readonly executionId: string;
  readonly steps: readonly AIExecutionTraceStep[];
}

export function createEmptyTrace(executionId: string): AIExecutionTrace {
  return Object.freeze({
    executionId,
    steps: Object.freeze([] as AIExecutionTraceStep[]),
  });
}
