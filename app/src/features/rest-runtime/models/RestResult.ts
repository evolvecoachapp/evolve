import type { RestEvent } from "./RestEvent";
import type { RestMetrics } from "./RestMetrics";
import type { RestProgress } from "./RestProgress";
import type { RestReason } from "./RestReason";
import type { RestState } from "./RestState";
import type { RestSummary } from "./RestSummary";

/**
 * Immutable terminal outcome of a finished, cancelled, or expired rest.
 */
export interface RestResult {
  readonly runtimeId: string;
  readonly sessionId: string;
  readonly finalState: Extract<RestState, "Completed" | "Cancelled" | "Expired">;
  readonly summary: RestSummary;
  readonly progress: RestProgress;
  readonly metrics: RestMetrics;
  readonly events: readonly RestEvent[];
  readonly reason: RestReason;
  readonly startedAt: string | null;
  readonly completedAt: string | null;
  readonly cancelledAt: string | null;
  readonly expiredAt: string | null;
  readonly frozenAt: string;
}
