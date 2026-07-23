import { StreamEventTypes } from "../models/StreamEventType";
import { StreamStatuses } from "../models/StreamStatus";
import {
  StreamError,
  toStreamErrorSnapshot,
  type StreamErrorSnapshot,
} from "../models/StreamError";
import { createStreamEvent } from "../events/createStreamEvent";
import { appendTraceStep, createTraceStep } from "../utils/buildTrace";
import {
  freezeLifecycle,
  freezeMetrics,
  freezeState,
} from "../utils/freezeObjects";
import type { StreamHandler, StreamWorkingContext } from "./types";

function durationMs(startedAt: string, completedAt: string): number {
  const start = Date.parse(startedAt);
  const end = Date.parse(completedAt);
  if (Number.isNaN(start) || Number.isNaN(end)) {
    return 0;
  }
  return Math.max(0, end - start);
}

export function toWorkingError(
  error: unknown,
  providerId: string | null,
): StreamErrorSnapshot {
  if (error instanceof StreamError) {
    return toStreamErrorSnapshot(error);
  }

  const streamError = new StreamError(
    "stream_failed",
    error instanceof Error ? error.message : "Stream failed",
    {
      status: StreamStatuses.FAILED,
      providerId,
      details: Object.freeze({
        name: error instanceof Error ? error.name : "unknown",
      }),
    },
  );
  return toStreamErrorSnapshot(streamError);
}

/**
 * Handle stream failure.
 */
export function createErrorHandler(): StreamHandler {
  return {
    name: "error",
    handle(context: StreamWorkingContext): StreamWorkingContext {
      if (!context.error) {
        return context;
      }

      const event = createStreamEvent({
        streamId: context.state.streamId,
        type: StreamEventTypes.STREAM_FAILED,
        occurredAt: context.now,
        status: StreamStatuses.FAILED,
        message: context.error.message,
        chunkIndex: context.state.lastChunkIndex,
        attributes: Object.freeze({
          code: context.error.code,
        }),
      });

      const metrics = freezeMetrics({
        ...context.state.metrics,
        durationMs: durationMs(context.startedAt, context.now),
      });

      const lifecycle = freezeLifecycle({
        status: StreamStatuses.FAILED,
        events: Object.freeze([
          ...context.state.lifecycle.events,
          event,
        ]),
        startedAt: context.state.startedAt ?? context.startedAt,
        completedAt: context.now,
      });

      const trace = appendTraceStep(
        context.state.trace,
        createTraceStep({
          type: StreamEventTypes.STREAM_FAILED,
          status: StreamStatuses.FAILED,
          occurredAt: context.now,
          message: context.error.message,
          chunkIndex: context.state.lastChunkIndex,
        }),
      );

      const state = freezeState({
        ...context.state,
        status: StreamStatuses.FAILED,
        error: context.error,
        lifecycle,
        metrics,
        trace,
        updatedAt: context.now,
        completedAt: context.now,
      });

      return {
        ...context,
        state,
        pendingEvents: [...context.pendingEvents, event],
      };
    },
  };
}
