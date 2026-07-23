import { StreamEventTypes } from "../models/StreamEventType";
import { StreamStatuses } from "../models/StreamStatus";
import { createStreamEvent } from "../events/createStreamEvent";
import { appendTraceStep, createTraceStep } from "../utils/buildTrace";
import { freezeLifecycle, freezeMetrics, freezeState } from "../utils/freezeObjects";
import type { StreamHandler, StreamWorkingContext } from "./types";

/**
 * Handle tokens derived from the latest chunk.
 */
export function createTokenHandler(): StreamHandler {
  return {
    name: "token",
    handle(context: StreamWorkingContext): StreamWorkingContext {
      const chunk = context.lastChunk;
      if (!chunk || chunk.delta.length === 0) {
        return { ...context, lastTokens: Object.freeze([]) };
      }

      const tokens = context.tokenAggregator.addFromChunk(chunk);
      if (tokens.length === 0) {
        return { ...context, lastTokens: Object.freeze([]) };
      }

      const events = tokens.map((token) =>
        createStreamEvent({
          streamId: context.state.streamId,
          type: StreamEventTypes.TOKEN_RECEIVED,
          occurredAt: context.now,
          status: StreamStatuses.STREAMING,
          chunkIndex: chunk.index,
          message: `token ${token.index}`,
          attributes: Object.freeze({
            tokenIndex: token.index,
            valueLength: token.value.length,
          }),
        }),
      );

      const metrics = freezeMetrics({
        ...context.state.metrics,
        tokenCount: context.tokenAggregator.getCount(),
      });

      const lifecycle = freezeLifecycle({
        ...context.state.lifecycle,
        events: Object.freeze([
          ...context.state.lifecycle.events,
          ...events,
        ]),
      });

      const trace = appendTraceStep(
        context.state.trace,
        createTraceStep({
          type: StreamEventTypes.TOKEN_RECEIVED,
          status: StreamStatuses.STREAMING,
          occurredAt: context.now,
          chunkIndex: chunk.index,
          message: `${tokens.length} tokens`,
        }),
      );

      const state = freezeState({
        ...context.state,
        tokens: context.tokenAggregator.getTokens(),
        lifecycle,
        metrics,
        trace,
        updatedAt: context.now,
      });

      return {
        ...context,
        state,
        lastTokens: tokens,
        pendingEvents: [...context.pendingEvents, ...events],
      };
    },
  };
}
