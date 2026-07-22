import type { RestReason } from "./RestReason";
import type { RestTarget } from "./RestTarget";

/**
 * Immutable descriptor that seeds a RestRuntime.
 * Does not include live timing state.
 */
export interface RestSession {
  readonly id: string;
  readonly reason: RestReason;
  readonly target: RestTarget;
  /** Optional owning workout runtime id (integration link; no circular import). */
  readonly workoutRuntimeId: string | null;
  readonly exerciseRuntimeId: string | null;
  readonly setRuntimeId: string | null;
  readonly label: string | null;
}
