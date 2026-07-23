/**
 * Cancellation descriptor for an active or requested stream.
 */
export interface StreamCancellation {
  readonly requested: boolean;
  readonly token: string | null;
  readonly reason: string | null;
  readonly requestedAt: string | null;
}

export const NO_STREAM_CANCELLATION: StreamCancellation = Object.freeze({
  requested: false,
  token: null,
  reason: null,
  requestedAt: null,
});
