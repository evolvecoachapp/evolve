import { createChunkAggregator } from "../aggregators/ChunkAggregator";
import { createTokenAggregator } from "../aggregators/TokenAggregator";
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
import { createInitialStreamState } from "../models/StreamState";
import { StreamStatuses } from "../models/StreamStatus";
import {
  createStreamChunkFixture,
  createStreamRequestFixture,
  FIXED_TIMESTAMP,
} from "../testSupport/fixtures";

function baseContext(
  overrides: Partial<StreamWorkingContext> = {},
): StreamWorkingContext {
  const request = createStreamRequestFixture();
  return {
    request,
    state: createInitialStreamState({
      streamId: "stream:handler",
      requestId: request.id,
    }),
    chunkAggregator: createChunkAggregator(),
    tokenAggregator: createTokenAggregator(),
    pendingEvents: [],
    lastChunk: null,
    lastTokens: Object.freeze([]),
    error: null,
    now: FIXED_TIMESTAMP,
    startedAt: FIXED_TIMESTAMP,
    cancelled: false,
    cancelReason: null,
    ...overrides,
  };
}

describe("streaming handlers", () => {
  it("LifecycleHandler emits stream_started from pending", () => {
    const handler = createLifecycleHandler();
    const next = handler.handle(baseContext());
    expect(next.state.status).toBe(StreamStatuses.STARTING);
    expect(next.pendingEvents[0]?.type).toBe("stream_started");
  });

  it("ChunkHandler aggregates content", () => {
    const handler = createChunkHandler();
    const chunk = createStreamChunkFixture({
      streamId: "stream:handler",
      delta: "Hi",
    });
    const next = handler.handle(
      baseContext({
        lastChunk: chunk,
        state: {
          ...createInitialStreamState({
            streamId: "stream:handler",
            requestId: "stream-req:fixture",
          }),
          status: StreamStatuses.STREAMING,
        },
      }),
    );
    expect(next.state.content).toBe("Hi");
    expect(next.state.metrics.chunkCount).toBe(1);
  });

  it("TokenHandler derives tokens from delta", () => {
    const handler = createTokenHandler();
    const chunk = createStreamChunkFixture({
      streamId: "stream:handler",
      delta: "Hi there",
    });
    const next = handler.handle(baseContext({ lastChunk: chunk }));
    expect(next.lastTokens.length).toBeGreaterThan(0);
    expect(next.state.metrics.tokenCount).toBeGreaterThan(0);
  });

  it("CompletionHandler marks completed", () => {
    const handler = createCompletionHandler();
    const next = handler.handle(
      baseContext({
        lastChunk: createStreamChunkFixture({ isFinal: true, finishReason: "stop" }),
        state: {
          ...createInitialStreamState({
            streamId: "stream:handler",
            requestId: "stream-req:fixture",
          }),
          status: StreamStatuses.STREAMING,
          content: "done",
        },
      }),
    );
    expect(next.state.status).toBe(StreamStatuses.COMPLETED);
    expect(next.state.completion.completed).toBe(true);
  });

  it("CancellationHandler marks cancelled", () => {
    const handler = createCancellationHandler();
    const next = handler.handle(
      baseContext({ cancelled: true, cancelReason: "abort" }),
    );
    expect(next.state.status).toBe(StreamStatuses.CANCELLED);
    expect(next.state.cancellation.reason).toBe("abort");
  });

  it("ErrorHandler marks failed", () => {
    const handler = createErrorHandler();
    const next = handler.handle(
      baseContext({
        error: toWorkingError(new Error("boom"), "test-provider"),
      }),
    );
    expect(next.state.status).toBe(StreamStatuses.FAILED);
    expect(next.state.error?.message).toContain("boom");
  });
});
