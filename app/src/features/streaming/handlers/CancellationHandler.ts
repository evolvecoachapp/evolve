import { StreamEventTypes } from "../models/StreamEventType";
import { StreamStatuses } from "../models/StreamStatus";
import { createStreamEvent } from "../events/createStreamEvent";
import { appendTraceStep, createTraceStep } from "../utils/buildTrace";
import {
  freezeCancellation,
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
 * Handle stream cancellation.
 */
export function createCancellationHandler(): StreamHandler {
  return {
    name: "cancellation",
    handle(context: StreamWorkingContext): StreamWorkingContext {
      if (!context.cancelled) {
        return context;
      }

      const reason = context.cancelReason ?? "cancelled";
      const event = createStreamEvent({
        streamId: context.state.streamId,
        type: StreamEventTypes.STREAM_CANCELLED,
        occurredAt: context.now,
        status: StreamStatuses.CANCELLED,
        message: reason,
        chunkIndex: context.state.lastChunkIndex,
      });

      const cancellation = freezeCancellation({
        requested: true,
        token: context.request.cancellation.token,
        reason,
        requestedAt:
          context.request.cancellation.requestedAt ?? context.now,
      });

      const metrics = freezeMetrics({
        ...context.state.metrics,
        durationMs: durationMs(context.startedAt, context.now),
      });

      const lifecycle = freezeLifecycle({
        status: StreamStatuses.CANCELLED,
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
          type: StreamEventTypes.STREAM_CANCELLED,
          status: StreamStatuses.CANCELLED,
          occurredAt: context.now,
          message: reason,
          chunkIndex: context.state.lastChunkIndex,
        }),
      );

      const state = freezeState({
        ...context.state,
        status: StreamStatuses.CANCELLED,
        cancellation,
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
