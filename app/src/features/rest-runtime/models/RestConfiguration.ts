/**
 * Rest runtime configuration knobs (no platform timers).
 */
export interface RestConfiguration {
  /** Target rest duration in milliseconds. */
  readonly targetDurationMs: number;
  /** Allow elapsed to exceed target without auto-expire. */
  readonly allowOvertime: boolean;
  /** Auto-transition to Expired when elapsed reaches target. */
  readonly autoExpireOnTarget: boolean;
  /** Fixed ISO timestamp override for deterministic tests. */
  readonly fixedTimestamp: string | null;
}

export const DEFAULT_REST_CONFIGURATION: RestConfiguration = Object.freeze({
  targetDurationMs: 90_000,
  allowOvertime: true,
  autoExpireOnTarget: false,
  fixedTimestamp: null,
});
