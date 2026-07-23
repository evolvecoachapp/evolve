/**
 * Retry policy interface.
 *
 * No concrete retry algorithm in this sprint.
 */
export interface RetryPolicy {
  readonly enabled: boolean;
  readonly maxAttempts: number | null;
  readonly backoffMs: number | null;
}
