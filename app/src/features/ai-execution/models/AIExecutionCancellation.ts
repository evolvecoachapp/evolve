/**
 * Cancellation descriptor for an execution request.
 *
 * Policy only — no cancellation algorithm in this sprint.
 */
export interface AIExecutionCancellation {
  readonly requested: boolean;
  readonly token: string | null;
  readonly reason: string | null;
  readonly requestedAt: string | null;
}

export const NO_CANCELLATION: AIExecutionCancellation = Object.freeze({
  requested: false,
  token: null,
  reason: null,
  requestedAt: null,
});
