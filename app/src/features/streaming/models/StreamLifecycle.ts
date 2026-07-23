import type { StreamEvent } from "./StreamEvent";
import type { StreamStatus } from "./StreamStatus";

/**
 * Immutable lifecycle record for a stream run.
 */
export interface StreamLifecycle {
  readonly status: StreamStatus;
  readonly events: readonly StreamEvent[];
  readonly startedAt: string | null;
  readonly completedAt: string | null;
}

export const EMPTY_STREAM_LIFECYCLE: StreamLifecycle = Object.freeze({
  status: "pending",
  events: Object.freeze([] as StreamEvent[]),
  startedAt: null,
  completedAt: null,
});
