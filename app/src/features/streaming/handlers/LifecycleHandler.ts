import { StreamEventTypes } from "../models/StreamEventType";
import { StreamStatuses } from "../models/StreamStatus";
import { createStreamEvent } from "../events/createStreamEvent";
import { appendTraceStep, createTraceStep } from "../utils/buildTrace";
import { freezeLifecycle, freezeState } from "../utils/freezeObjects";
import type { StreamHandler, StreamWorkingContext } from "./types";

/**
 * Handle stream lifecycle start / progress / heartbeat events.
 */
export function createLifecycleHandler(): StreamHandler {
  return {
    name: "lifecycle",
    handle(context: StreamWorkingContext): StreamWorkingContext {
      if (context.state.status !== StreamStatuses.PENDING) {
        // Emit heartbeat / progress while streaming
        if (context.state.status === StreamStatuses.STREAMING) {
          const heartbeat = createStreamEvent({
            streamId: context.state.streamId,
            type: StreamEventTypes.HEARTBEAT,
            occurredAt: context.now,
            status: StreamStatuses.STREAMING,
            message: "heartbeat",
            attributes: Object.freeze({
              chunkCount: context.state.metrics.chunkCount,
            }),
          });

          const progress = createStreamEvent({
            streamId: context.state.streamId,
            type: StreamEventTypes.PROGRESS_UPDATED,
            occurredAt: context.now,
            status: StreamStatuses.STREAMING,
            chunkIndex: context.state.lastChunkIndex,
            message: "progress",
            attributes: Object.freeze({
              contentLength: context.state.content.length,
              chunkCount: context.state.metrics.chunkCount,
              tokenCount: context.state.metrics.tokenCount,
            }),
          });

          const lifecycle = freezeLifecycle({
            ...context.state.lifecycle,
            events: Object.freeze([
              ...context.state.lifecycle.events,
              heartbeat,
              progress,
            ]),
          });

          const metrics = {
            ...context.state.metrics,
            heartbeatCount: context.state.metrics.heartbeatCount + 1,
          };

          const state = freezeState({
            ...context.state,
            lifecycle,
            metrics,
            updatedAt: context.now,
          });

          return {
            ...context,
            state,
            pendingEvents: [
              ...context.pendingEvents,
              heartbeat,
              progress,
            ],
          };
        }

        return context;
      }

      const started = createStreamEvent({
        streamId: context.state.streamId,
        type: StreamEventTypes.STREAM_STARTED,
        occurredAt: context.now,
        status: StreamStatuses.STARTING,
        message: "stream started",
      });

      const lifecycle = freezeLifecycle({
        status: StreamStatuses.STARTING,
        events: Object.freeze([started]),
        startedAt: context.now,
        completedAt: null,
      });

      const trace = appendTraceStep(
        context.state.trace,
        createTraceStep({
          type: StreamEventTypes.STREAM_STARTED,
          status: StreamStatuses.STARTING,
          occurredAt: context.now,
          message: started.message,
        }),
      );

      const state = freezeState({
        ...context.state,
        status: StreamStatuses.STARTING,
        lifecycle,
        trace,
        startedAt: context.now,
        updatedAt: context.now,
      });

      return {
        ...context,
        state,
        startedAt: context.now,
        pendingEvents: [...context.pendingEvents, started],
      };
    },
  };
}
