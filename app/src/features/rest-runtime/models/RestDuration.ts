/**
 * Immutable duration value in milliseconds.
 */
export interface RestDuration {
  readonly milliseconds: number;
}

/**
 * Create a frozen RestDuration. Rejects negative values.
 */
export function createRestDuration(milliseconds: number): RestDuration {
  if (!Number.isFinite(milliseconds) || milliseconds < 0) {
    throw new Error(`invalid_duration:${milliseconds}`);
  }
  return Object.freeze({ milliseconds: Math.floor(milliseconds) });
}

export function durationMs(duration: RestDuration): number {
  return duration.milliseconds;
}
