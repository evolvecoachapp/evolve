/**
 * Timeout descriptor for an execution request.
 *
 * Policy only — no timeout enforcement algorithm in this sprint.
 */
export interface AIExecutionTimeout {
  readonly enabled: boolean;
  readonly timeoutMs: number | null;
  readonly timedOut: boolean;
  readonly elapsedMs: number | null;
}

export const NO_TIMEOUT: AIExecutionTimeout = Object.freeze({
  enabled: false,
  timeoutMs: null,
  timedOut: false,
  elapsedMs: null,
});
