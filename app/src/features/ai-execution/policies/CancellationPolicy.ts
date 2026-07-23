/**
 * Cancellation policy interface.
 *
 * No concrete cancellation algorithm in this sprint.
 */
export interface CancellationPolicy {
  readonly enabled: boolean;
  readonly token: string | null;
}
