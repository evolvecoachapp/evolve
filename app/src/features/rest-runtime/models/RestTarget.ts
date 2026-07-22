import type { RestDuration } from "./RestDuration";

/**
 * Immutable target for a rest period.
 */
export interface RestTarget {
  readonly duration: RestDuration;
  /** When true, elapsed may exceed target without auto-expiring. */
  readonly allowOvertime: boolean;
  /** When true, reaching target while Running transitions to Expired. */
  readonly expireOnTarget: boolean;
}
