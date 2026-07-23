import { StreamEventTypes } from "../models/StreamEventType";
import { StreamStatuses } from "../models/StreamStatus";
import {
  createStreamChunkFixture,
  createStreamRequestFixture,
  createTestStreamingHarness,
} from "../testSupport/fixtures";

describe("StreamingEngine", () => {
  it("starts a stream, aggregates chunks, and completes", async () => {
    const { engine, providerId } = createTestStreamingHarness();
    const request = createStreamRequestFixture({ providerId });

    const snapshot = await engine.start(request);

    expect(snapshot.state.status).toBe(StreamStatuses.COMPLETED);
    expect(snapshot.response.content).toBe("Hello world");
    expect(snapshot.state.metrics.chunkCount).toBe(2);
    expect(snapshot.state.completion.completed).toBe(true);
    expect(Object.isFrozen(snapshot)).toBe(true);
    expect(Object.isFrozen(snapshot.state)).toBe(true);

    const types = snapshot.state.lifecycle.events.map((e) => e.type);
    expect(types).toContain(StreamEventTypes.STREAM_STARTED);
    expect(types).toContain(StreamEventTypes.CHUNK_RECEIVED);
    expect(types).toContain(StreamEventTypes.STREAM_COMPLETED);
  });

  it("handles cancellation mid-stream", async () => {
    const streamIdRef = { current: "" };
    const { engine, providerId, service } = createTestStreamingHarness({
      delayMs: 20,
      onChunk: (_chunk, index) => {
        if (index === 0 && streamIdRef.current) {
          service.cancelStream(streamIdRef.current, "user_abort");
        }
      },
    });

    const request = createStreamRequestFixture({
      id: "stream-req:cancel",
      providerId,
    });
    streamIdRef.current = `stream:${request.id}`;

    const snapshot = await engine.start(request);

    expect(snapshot.state.status).toBe(StreamStatuses.CANCELLED);
    expect(snapshot.state.cancellation.requested).toBe(true);
    expect(snapshot.summary.cancelled).toBe(true);
  });

  it("returns failed snapshot when source throws", async () => {
    const { engine, providerId } = createTestStreamingHarness({
      error: new Error("provider boom"),
    });
    const request = createStreamRequestFixture({ providerId });

    const snapshot = await engine.start(request);

    expect(snapshot.state.status).toBe(StreamStatuses.FAILED);
    expect(snapshot.state.error?.message).toContain("provider boom");
    expect(snapshot.summary.failed).toBe(true);
  });

  it("throws when stream source is missing", async () => {
    const { engine } = createTestStreamingHarness();
    const request = createStreamRequestFixture({
      providerId: "missing-provider",
    });

    await expect(engine.start(request)).rejects.toThrow(/No stream source/);
  });

  it("records validation issues for out-of-order chunks", async () => {
    const { engine, providerId } = createTestStreamingHarness({
      chunks: [
        createStreamChunkFixture({ id: "c1", index: 1, delta: "B" }),
        createStreamChunkFixture({
          id: "c0",
          index: 0,
          delta: "A",
          isFinal: true,
        }),
      ],
    });

    const snapshot = await engine.start(
      createStreamRequestFixture({ providerId }),
    );

    expect(snapshot.state.status).toBe(StreamStatuses.COMPLETED);
    expect(
      snapshot.state.validationIssues.some((issue) =>
        issue.includes("stream_chunk_order_invalid"),
      ),
    ).toBe(true);
  });
});
