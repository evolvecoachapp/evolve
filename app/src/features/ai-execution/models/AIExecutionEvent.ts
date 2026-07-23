import type { AIExecutionStage } from "./AIExecutionStage";
import type { AIExecutionStatus } from "./AIExecutionStatus";

/**
 * Immutable lifecycle event emitted during pipeline execution.
 */
export interface AIExecutionEvent {
  readonly id: string;
  readonly type: string;
  readonly stage: AIExecutionStage | null;
  readonly status: AIExecutionStatus | null;
  readonly message: string | null;
  readonly occurredAt: string;
  readonly attributes: Readonly<
    Record<string, string | number | boolean | null>
  >;
}
