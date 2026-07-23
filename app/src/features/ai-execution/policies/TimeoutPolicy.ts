/**
 * Timeout policy interface.
 *
 * No concrete timeout enforcement algorithm in this sprint.
 */
export interface TimeoutPolicy {
  readonly enabled: boolean;
  readonly timeoutMs: number | null;
}
