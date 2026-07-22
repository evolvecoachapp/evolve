import type { RestConfiguration } from "./RestConfiguration";
import type { RestEvent } from "./RestEvent";
import type { RestMetrics } from "./RestMetrics";
import type { RestProgress } from "./RestProgress";
import type { RestSession } from "./RestSession";
import type { RestState } from "./RestState";
import type { RestStatus } from "./RestStatus";

/**
 * Mutable-in-engine rest runtime seeded from an immutable RestSession.
 * Elapsed time is injected externally — no platform timers.
 */
export interface RestRuntime {
  readonly id: string;
  readonly sessionId: string;
  /** Frozen reference to the source rest session. */
  readonly session: RestSession;
  readonly state: RestState;
  readonly status: RestStatus;
  readonly configuration: RestConfiguration;
  readonly progress: RestProgress;
  readonly metrics: RestMetrics;
  readonly events: readonly RestEvent[];
  readonly startedAt: string | null;
  readonly pausedAt: string | null;
  readonly completedAt: string | null;
  readonly cancelledAt: string | null;
  readonly expiredAt: string | null;
}
