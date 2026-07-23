import { StreamEventTypes } from "../models/StreamEventType";
import { StreamStatuses } from "../models/StreamStatus";
import { createStreamEvent } from "../events/createStreamEvent";
import { appendTraceStep, createTraceStep } from "../utils/buildTrace";
import {
  freezeCompletion,
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

/**
 * Handle successful stream completion.
 */
export function createCompletionHandler(): StreamHandler {
  return {
    name: "completion",
    handle(context: StreamWorkingContext): StreamWorkingContext {
      if (context.cancelled || context.error) {
        return context;
      }

      const finishReason =
        context.lastChunk?.finishReason ??
        (context.lastChunk?.isFinal ? "stop" : "end");

      const completingEvent = createStreamEvent({
        streamId: context.state.streamId,
        type: StreamEventTypes.PROGRESS_UPDATED,
        occurredAt: context.now,
        status: StreamStatuses.COMPLETING,
        message: "completing",
      });

      const completedEvent = createStreamEvent({
        streamId: context.state.streamId,
        type: StreamEventTypes.STREAM_COMPLETED,
        occurredAt: context.now,
        status: StreamStatuses.COMPLETED,
        chunkIndex: context.state.lastChunkIndex,
        message: "stream completed",
        attributes: Object.freeze({ finishReason }),
      });

      const completion = freezeCompletion({
        completed: true,
        finishReason,
        completedAt: context.now,
        finalChunkIndex: context.state.lastChunkIndex,
      });

      const metrics = freezeMetrics({
        ...context.state.metrics,
        durationMs: durationMs(context.startedAt, context.now),
        contentLength: context.state.content.length,
        chunkCount: context.chunkAggregator.getCount(),
        tokenCount: context.tokenAggregator.getCount(),
      });

      const lifecycle = freezeLifecycle({
        status: StreamStatuses.COMPLETED,
        events: Object.freeze([
          ...context.state.lifecycle.events,
          completingEvent,
          completedEvent,
        ]),
        startedAt: context.state.startedAt ?? context.startedAt,
        completedAt: context.now,
      });

      let trace = appendTraceStep(
        context.state.trace,
        createTraceStep({
          type: "lifecycle",
          status: StreamStatuses.COMPLETING,
          occurredAt: context.now,
          message: "completing",
        }),
      );
      trace = appendTraceStep(
        trace,
        createTraceStep({
          type: StreamEventTypes.STREAM_COMPLETED,
          status: StreamStatuses.COMPLETED,
          occurredAt: context.now,
          chunkIndex: context.state.lastChunkIndex,
          message: completedEvent.message,
        }),
      );

      const state = freezeState({
        ...context.state,
        status: StreamStatuses.COMPLETED,
        completion,
        lifecycle,
        metrics,
        trace,
        updatedAt: context.now,
        completedAt: context.now,
      });

      return {
        ...context,
        state,
        pendingEvents: [
          ...context.pendingEvents,
          completingEvent,
          completedEvent,
        ],
      };
    },
  };
}
