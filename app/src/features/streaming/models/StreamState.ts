import type { StreamCancellation } from "./StreamCancellation";
import type { StreamChunk } from "./StreamChunk";
import type { StreamCompletion } from "./StreamCompletion";
import type { StreamErrorSnapshot } from "./StreamError";
import type { StreamLifecycle } from "./StreamLifecycle";
import type { StreamMetadata } from "./StreamMetadata";
import type { StreamMetrics } from "./StreamMetrics";
import type { StreamStatus } from "./StreamStatus";
import type { StreamToken } from "./StreamToken";
import type { StreamTrace } from "./StreamTrace";
import { EMPTY_STREAM_COMPLETION } from "./StreamCompletion";
import { EMPTY_STREAM_LIFECYCLE } from "./StreamLifecycle";
import { EMPTY_STREAM_METADATA } from "./StreamMetadata";
import { EMPTY_STREAM_METRICS } from "./StreamMetrics";
import { NO_STREAM_CANCELLATION } from "./StreamCancellation";
import { createEmptyStreamTrace } from "./StreamTrace";
import { StreamStatuses } from "./StreamStatus";

/**
 * Immutable snapshot of stream state produced by the streaming engine.
 */
export interface StreamState {
  readonly streamId: string;
  readonly requestId: string;
  readonly status: StreamStatus;
  readonly content: string;
  readonly chunks: readonly StreamChunk[];
  readonly tokens: readonly StreamToken[];
  readonly lastChunkIndex: number | null;
  readonly lifecycle: StreamLifecycle;
  readonly metrics: StreamMetrics;
  readonly completion: StreamCompletion;
  readonly cancellation: StreamCancellation;
  readonly error: StreamErrorSnapshot | null;
  readonly metadata: StreamMetadata;
  readonly trace: StreamTrace;
  readonly validationIssues: readonly string[];
  readonly startedAt: string | null;
  readonly updatedAt: string | null;
  readonly completedAt: string | null;
}

export function createInitialStreamState(options: {
  readonly streamId: string;
  readonly requestId: string;
  readonly metadata?: StreamMetadata;
}): StreamState {
  return Object.freeze({
    streamId: options.streamId,
    requestId: options.requestId,
    status: StreamStatuses.PENDING,
    content: "",
    chunks: Object.freeze([] as StreamChunk[]),
    tokens: Object.freeze([] as StreamToken[]),
    lastChunkIndex: null,
    lifecycle: EMPTY_STREAM_LIFECYCLE,
    metrics: EMPTY_STREAM_METRICS,
    completion: EMPTY_STREAM_COMPLETION,
    cancellation: NO_STREAM_CANCELLATION,
    error: null,
    metadata: options.metadata ?? EMPTY_STREAM_METADATA,
    trace: createEmptyStreamTrace(options.streamId),
    validationIssues: Object.freeze([] as string[]),
    startedAt: null,
    updatedAt: null,
    completedAt: null,
  });
}
