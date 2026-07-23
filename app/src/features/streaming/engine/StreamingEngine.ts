import type { IStreamSourceResolver } from "../contracts/IStreamSource";
import { createChunkAggregator } from "../aggregators/ChunkAggregator";
import { createTokenAggregator } from "../aggregators/TokenAggregator";
import { createSummaryAggregator } from "../aggregators/SummaryAggregator";
import {
  createCancellationHandler,
  createChunkHandler,
  createCompletionHandler,
  createErrorHandler,
  createLifecycleHandler,
  createTokenHandler,
  toWorkingError,
  type StreamWorkingContext,
} from "../handlers";
import { StreamError } from "../models/StreamError";
import { createInitialStreamState } from "../models/StreamState";
import type { StreamRequest } from "../models/StreamRequest";
import type { StreamResponse } from "../models/StreamResponse";
import type { StreamSnapshot } from "../models/StreamSnapshot";
import type { StreamState } from "../models/StreamState";
import type { StreamSummary } from "../models/StreamSummary";
import { StreamStatuses } from "../models/StreamStatus";
import { validateChunkOrder } from "../validators/validateChunkOrder";
import { validateStreamRequest } from "../validators/validateStreamRequest";
import { normalizeChunk } from "../utils/normalizeChunks";
import {
  freezeResponse,
  freezeSnapshot,
  freezeState,
} from "../utils/freezeObjects";
import { summarizeStreamState } from "../utils/summarizeStream";

export interface StreamingEngineDeps {
  readonly sourceResolver: IStreamSourceResolver;
  readonly clock?: () => string;
}

interface ActiveStreamControl {
  cancelled: boolean;
  cancelReason: string | null;
  state: StreamState;
  done: Promise<StreamSnapshot>;
  resolveDone: (snapshot: StreamSnapshot) => void;
}

/**
 * Streaming Engine — provider-agnostic stream coordination.
 *
 * Start → receive events → aggregate chunks → update state → complete / cancel.
 *
 * No provider-specific code. No memory. No tool calling.
 */
export class StreamingEngine {
  private readonly sourceResolver: IStreamSourceResolver;
  private readonly clock: () => string;
  private readonly active = new Map<string, ActiveStreamControl>();

  private readonly lifecycleHandler = createLifecycleHandler();
  private readonly chunkHandler = createChunkHandler();
  private readonly tokenHandler = createTokenHandler();
  private readonly completionHandler = createCompletionHandler();
  private readonly cancellationHandler = createCancellationHandler();
  private readonly errorHandler = createErrorHandler();
  private readonly summaryAggregator = createSummaryAggregator();

  constructor(deps: StreamingEngineDeps) {
    this.sourceResolver = deps.sourceResolver;
    this.clock = deps.clock ?? (() => new Date().toISOString());
  }

  /**
   * Start a stream and wait until it completes, cancels, or fails.
   */
  async start(request: StreamRequest): Promise<StreamSnapshot> {
    const validationIssues = validateStreamRequest(request);
    if (validationIssues.length > 0) {
      throw new StreamError(
        "stream_request_invalid",
        "Stream request invalid",
        {
          status: StreamStatuses.FAILED,
          providerId: request.providerId,
          details: Object.freeze({ issues: validationIssues }),
        },
      );
    }

    if (request.cancellation.requested) {
      return this.buildCancelledBeforeStart(request);
    }

    const source = this.sourceResolver.resolve(request.providerId);
    if (!source) {
      throw new StreamError(
        "stream_source_not_found",
        `No stream source for provider: ${request.providerId}`,
        {
          status: StreamStatuses.FAILED,
          providerId: request.providerId,
        },
      );
    }

    const streamId = `stream:${request.id}`;
    const startedAt = this.clock();

    let resolveDone!: (snapshot: StreamSnapshot) => void;
    const done = new Promise<StreamSnapshot>((resolve) => {
      resolveDone = resolve;
    });

    const control: ActiveStreamControl = {
      cancelled: false,
      cancelReason: null,
      state: createInitialStreamState({
        streamId,
        requestId: request.id,
        metadata: request.metadata,
      }),
      done,
      resolveDone,
    };
    this.active.set(streamId, control);

    try {
      let context = this.createWorkingContext(request, streamId, startedAt);
      context = this.lifecycleHandler.handle(context);
      control.state = context.state;

      for await (const rawChunk of source.stream(request)) {
        if (control.cancelled) {
          break;
        }

        const chunk = normalizeChunk({
          ...rawChunk,
          streamId,
        });

        const orderIssues = validateChunkOrder([
          ...context.chunkAggregator.getChunks(),
          chunk,
        ]);

        context = {
          ...context,
          now: this.clock(),
          lastChunk: chunk,
          pendingEvents: [],
        };

        context = this.chunkHandler.handle(context);
        context = this.tokenHandler.handle(context);
        context = this.lifecycleHandler.handle(context);

        if (orderIssues.length > 0) {
          context = {
            ...context,
            state: freezeState({
              ...context.state,
              validationIssues: Object.freeze([
                ...context.state.validationIssues,
                ...orderIssues,
              ]),
            }),
          };
        }

        control.state = context.state;

        if (chunk.isFinal) {
          break;
        }
      }

      context = {
        ...context,
        now: this.clock(),
        cancelled: control.cancelled,
        cancelReason: control.cancelReason,
        pendingEvents: [],
      };

      if (control.cancelled) {
        context = this.cancellationHandler.handle(context);
      } else {
        context = this.completionHandler.handle(context);
      }

      control.state = context.state;
      const snapshot = this.buildSnapshot(request, context.state);
      control.resolveDone(snapshot);
      return snapshot;
    } catch (error) {
      const failed = this.buildFailureSnapshot(request, control.state, error);
      control.resolveDone(failed);
      return failed;
    } finally {
      this.active.delete(streamId);
    }
  }

  /**
   * Request cancellation of an active stream.
   */
  cancel(streamId: string, reason: string | null = null): boolean {
    const control = this.active.get(streamId);
    if (!control) {
      return false;
    }
    control.cancelled = true;
    control.cancelReason = reason ?? "cancelled";
    return true;
  }

  /**
   * Get the latest state for an active stream, if any.
   */
  getActiveState(streamId: string): StreamState | null {
    return this.active.get(streamId)?.state ?? null;
  }

  summarize(state: StreamState, providerId: string | null = null): StreamSummary {
    return this.summaryAggregator.summarize(state, providerId);
  }

  private createWorkingContext(
    request: StreamRequest,
    streamId: string,
    startedAt: string,
  ): StreamWorkingContext {
    return {
      request,
      state: createInitialStreamState({
        streamId,
        requestId: request.id,
        metadata: request.metadata,
      }),
      chunkAggregator: createChunkAggregator(),
      tokenAggregator: createTokenAggregator(),
      pendingEvents: [],
      lastChunk: null,
      lastTokens: Object.freeze([]),
      error: null,
      now: startedAt,
      startedAt,
      cancelled: false,
      cancelReason: null,
    };
  }

  private buildResponse(
    request: StreamRequest,
    state: StreamState,
  ): StreamResponse {
    return freezeResponse({
      id: `stream-res:${state.streamId}`,
      streamId: state.streamId,
      requestId: request.id,
      providerId: request.providerId,
      status: state.status,
      content: state.content,
      chunkCount: state.metrics.chunkCount,
      tokenCount: state.metrics.tokenCount,
      completion: state.completion,
      error: state.error,
      metrics: state.metrics,
      completedAt: state.completedAt,
    });
  }

  private buildSnapshot(
    request: StreamRequest,
    state: StreamState,
  ): StreamSnapshot {
    const response = this.buildResponse(request, state);
    const summary = summarizeStreamState(state, request.providerId);
    return freezeSnapshot({
      id: `stream-snap:${state.streamId}`,
      streamId: state.streamId,
      requestId: request.id,
      providerId: request.providerId,
      state,
      response,
      summary,
      capturedAt: state.completedAt ?? this.clock(),
    });
  }

  private buildCancelledBeforeStart(request: StreamRequest): StreamSnapshot {
    const streamId = `stream:${request.id}`;
    const now = this.clock();
    let context = this.createWorkingContext(request, streamId, now);
    context = {
      ...context,
      cancelled: true,
      cancelReason: request.cancellation.reason ?? "cancelled",
      now,
    };
    context = this.cancellationHandler.handle(context);
    return this.buildSnapshot(request, context.state);
  }

  private buildFailureSnapshot(
    request: StreamRequest,
    priorState: StreamState,
    error: unknown,
  ): StreamSnapshot {
    const now = this.clock();
    const snapshotError = toWorkingError(error, request.providerId);
    let context: StreamWorkingContext = {
      request,
      state: priorState,
      chunkAggregator: createChunkAggregator(),
      tokenAggregator: createTokenAggregator(),
      pendingEvents: [],
      lastChunk: null,
      lastTokens: Object.freeze([]),
      error: snapshotError,
      now,
      startedAt: priorState.startedAt ?? now,
      cancelled: false,
      cancelReason: null,
    };
    context = this.errorHandler.handle(context);
    return this.buildSnapshot(request, context.state);
  }
}

export function createStreamingEngine(
  deps: StreamingEngineDeps,
): StreamingEngine {
  return new StreamingEngine(deps);
}
