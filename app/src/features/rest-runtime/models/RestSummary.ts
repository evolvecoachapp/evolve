import type { RestProgress } from "./RestProgress";
import type { RestReason } from "./RestReason";
import type { RestState } from "./RestState";
import type { RestStatus } from "./RestStatus";

/**
 * Public snapshot of an active (or terminal) rest runtime.
 * Safe to expose from the application layer.
 */
export interface RestSummary {
  readonly runtimeId: string;
  readonly sessionId: string;
  readonly state: RestState;
  readonly status: RestStatus;
  readonly reason: RestReason;
  readonly progress: RestProgress;
  readonly targetDurationMs: number;
  readonly elapsedMs: number;
  readonly remainingMs: number;
  readonly overtimeMs: number;
  readonly eventCount: number;
  readonly startedAt: string | null;
  readonly pausedAt: string | null;
}
