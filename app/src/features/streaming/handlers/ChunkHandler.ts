import { StreamEventTypes } from "../models/StreamEventType";
import { StreamStatuses } from "../models/StreamStatus";
import { createStreamEvent } from "../events/createStreamEvent";
import { appendTraceStep, createTraceStep } from "../utils/buildTrace";
import { freezeLifecycle, freezeMetrics, freezeState } from "../utils/freezeObjects";
import type { StreamHandler, StreamWorkingContext } from "./types";

/**
 * Handle a received stream chunk — aggregate + emit ChunkReceived.
 */
export function createChunkHandler(): StreamHandler {
  return {
    name: "chunk",
    handle(context: StreamWorkingContext): StreamWorkingContext {
      const chunk = context.lastChunk;
      if (!chunk) {
        return context;
      }

      context.chunkAggregator.add(chunk);
      const content = context.chunkAggregator.getContent();
      const chunkCount = context.chunkAggregator.getCount();
      const lastChunkIndex = context.chunkAggregator.getLastIndex();

      const event = createStreamEvent({
        streamId: context.state.streamId,
        type: StreamEventTypes.CHUNK_RECEIVED,
        occurredAt: context.now,
        status: StreamStatuses.STREAMING,
        chunkIndex: chunk.index,
        message: `chunk ${chunk.index}`,
        attributes: Object.freeze({
          deltaLength: chunk.delta.length,
          isFinal: chunk.isFinal,
        }),
      });

      const metrics = freezeMetrics({
        ...context.state.metrics,
        chunkCount,
        contentLength: content.length,
        bytesReceived: context.state.metrics.bytesReceived + chunk.delta.length,
        firstChunkAt: context.state.metrics.firstChunkAt ?? context.now,
        lastChunkAt: context.now,
      });

      const lifecycle = freezeLifecycle({
        ...context.state.lifecycle,
        status: StreamStatuses.STREAMING,
        events: Object.freeze([...context.state.lifecycle.events, event]),
      });

      const trace = appendTraceStep(
        context.state.trace,
        createTraceStep({
          type: StreamEventTypes.CHUNK_RECEIVED,
          status: StreamStatuses.STREAMING,
          occurredAt: context.now,
          chunkIndex: chunk.index,
          message: event.message,
        }),
      );

      const state = freezeState({
        ...context.state,
        status: StreamStatuses.STREAMING,
        content,
        chunks: context.chunkAggregator.getChunks(),
        lastChunkIndex,
        lifecycle,
        metrics,
        trace,
        updatedAt: context.now,
      });

      return {
        ...context,
        state,
        pendingEvents: [...context.pendingEvents, event],
      };
    },
  };
}
