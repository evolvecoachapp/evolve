import type { StreamCancellation } from "../models/StreamCancellation";
import { NO_STREAM_CANCELLATION } from "../models/StreamCancellation";
import type { StreamChunk } from "../models/StreamChunk";
import type { StreamCompletion } from "../models/StreamCompletion";
import { EMPTY_STREAM_COMPLETION } from "../models/StreamCompletion";
import type { StreamErrorSnapshot } from "../models/StreamError";
import type { StreamLifecycle } from "../models/StreamLifecycle";
import { EMPTY_STREAM_LIFECYCLE } from "../models/StreamLifecycle";
import type { StreamMetadata } from "../models/StreamMetadata";
import { EMPTY_STREAM_METADATA } from "../models/StreamMetadata";
import type { StreamMetrics } from "../models/StreamMetrics";
import { EMPTY_STREAM_METRICS } from "../models/StreamMetrics";
import type { StreamState } from "../models/StreamState";
import type { StreamStatus } from "../models/StreamStatus";
import { StreamStatuses } from "../models/StreamStatus";
import type { StreamToken } from "../models/StreamToken";
import type { StreamTrace } from "../models/StreamTrace";
import { createEmptyStreamTrace } from "../models/StreamTrace";
import { freezeState } from "../utils/freezeObjects";

/**
 * Fluent builder for immutable StreamState.
 */
export class StreamStateBuilder {
  private streamId = "";
  private requestId = "";
  private status: StreamStatus = StreamStatuses.PENDING;
  private content = "";
  private chunks: readonly StreamChunk[] = [];
  private tokens: readonly StreamToken[] = [];
  private lastChunkIndex: number | null = null;
  private lifecycle: StreamLifecycle = EMPTY_STREAM_LIFECYCLE;
  private metrics: StreamMetrics = EMPTY_STREAM_METRICS;
  private completion: StreamCompletion = EMPTY_STREAM_COMPLETION;
  private cancellation: StreamCancellation = NO_STREAM_CANCELLATION;
  private error: StreamErrorSnapshot | null = null;
  private metadata: StreamMetadata = EMPTY_STREAM_METADATA;
  private trace: StreamTrace | null = null;
  private validationIssues: readonly string[] = [];
  private startedAt: string | null = null;
  private updatedAt: string | null = null;
  private completedAt: string | null = null;

  withStreamId(streamId: string): this {
    this.streamId = streamId;
    return this;
  }

  withRequestId(requestId: string): this {
    this.requestId = requestId;
    return this;
  }

  withStatus(status: StreamStatus): this {
    this.status = status;
    return this;
  }

  withContent(content: string): this {
    this.content = content;
    return this;
  }

  withChunks(chunks: readonly StreamChunk[]): this {
    this.chunks = chunks;
    return this;
  }

  withTokens(tokens: readonly StreamToken[]): this {
    this.tokens = tokens;
    return this;
  }

  withLastChunkIndex(lastChunkIndex: number | null): this {
    this.lastChunkIndex = lastChunkIndex;
    return this;
  }

  withLifecycle(lifecycle: StreamLifecycle): this {
    this.lifecycle = lifecycle;
    return this;
  }

  withMetrics(metrics: StreamMetrics): this {
    this.metrics = metrics;
    return this;
  }

  withCompletion(completion: StreamCompletion): this {
    this.completion = completion;
    return this;
  }

  withCancellation(cancellation: StreamCancellation): this {
    this.cancellation = cancellation;
    return this;
  }

  withError(error: StreamErrorSnapshot | null): this {
    this.error = error;
    return this;
  }

  withMetadata(metadata: StreamMetadata): this {
    this.metadata = metadata;
    return this;
  }

  withTrace(trace: StreamTrace): this {
    this.trace = trace;
    return this;
  }

  withValidationIssues(issues: readonly string[]): this {
    this.validationIssues = issues;
    return this;
  }

  withStartedAt(startedAt: string | null): this {
    this.startedAt = startedAt;
    return this;
  }

  withUpdatedAt(updatedAt: string | null): this {
    this.updatedAt = updatedAt;
    return this;
  }

  withCompletedAt(completedAt: string | null): this {
    this.completedAt = completedAt;
    return this;
  }

  build(): StreamState {
    if (!this.streamId || !this.requestId) {
      throw new Error("StreamStateBuilder missing required fields");
    }

    return freezeState({
      streamId: this.streamId,
      requestId: this.requestId,
      status: this.status,
      content: this.content,
      chunks: this.chunks,
      tokens: this.tokens,
      lastChunkIndex: this.lastChunkIndex,
      lifecycle: this.lifecycle,
      metrics: this.metrics,
      completion: this.completion,
      cancellation: this.cancellation,
      error: this.error,
      metadata: this.metadata,
      trace: this.trace ?? createEmptyStreamTrace(this.streamId),
      validationIssues: Object.freeze([...this.validationIssues]),
      startedAt: this.startedAt,
      updatedAt: this.updatedAt,
      completedAt: this.completedAt,
    });
  }
}
