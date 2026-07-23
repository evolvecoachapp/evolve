import type { StreamEventType } from "./StreamEventType";
import type { StreamStatus } from "./StreamStatus";

/**
 * Immutable record of a single stream trace step.
 */
export interface StreamTraceStep {
  readonly type: StreamEventType | "lifecycle";
  readonly status: StreamStatus;
  readonly occurredAt: string;
  readonly message: string | null;
  readonly chunkIndex: number | null;
  readonly validationIssues: readonly string[];
}

/**
 * Ordered immutable stream execution trace.
 */
export interface StreamTrace {
  readonly streamId: string;
  readonly steps: readonly StreamTraceStep[];
}

export function createEmptyStreamTrace(streamId: string): StreamTrace {
  return Object.freeze({
    streamId,
    steps: Object.freeze([] as StreamTraceStep[]),
  });
}
