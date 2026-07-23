/**
 * Immutable stream metrics collected by the streaming engine.
 */
export interface StreamMetrics {
  readonly durationMs: number | null;
  readonly chunkCount: number;
  readonly tokenCount: number;
  readonly contentLength: number;
  readonly heartbeatCount: number;
  readonly firstChunkAt: string | null;
  readonly lastChunkAt: string | null;
  readonly bytesReceived: number;
}

export const EMPTY_STREAM_METRICS: StreamMetrics = Object.freeze({
  durationMs: null,
  chunkCount: 0,
  tokenCount: 0,
  contentLength: 0,
  heartbeatCount: 0,
  firstChunkAt: null,
  lastChunkAt: null,
  bytesReceived: 0,
});
