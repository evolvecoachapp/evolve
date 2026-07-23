/**
 * Immutable completion descriptor for a finished stream.
 */
export interface StreamCompletion {
  readonly completed: boolean;
  readonly finishReason: string | null;
  readonly completedAt: string | null;
  readonly finalChunkIndex: number | null;
}

export const EMPTY_STREAM_COMPLETION: StreamCompletion = Object.freeze({
  completed: false,
  finishReason: null,
  completedAt: null,
  finalChunkIndex: null,
});
