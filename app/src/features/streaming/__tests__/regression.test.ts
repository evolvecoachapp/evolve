import { startStream } from "../application";
import { StreamEventTypes } from "../models/StreamEventType";
import { StreamStatuses } from "../models/StreamStatus";
import {
  createTestStreamingHarness,
  FIXED_TIMESTAMP,
} from "../testSupport/fixtures";

describe("streaming regression", () => {
  it("keeps stream state and response immutable after completion", async () => {
    const { service, providerId } = createTestStreamingHarness();
    const snapshot = await startStream({
      providerId,
      service,
      createdAt: FIXED_TIMESTAMP,
    });

    expect(Object.isFrozen(snapshot)).toBe(true);
    expect(Object.isFrozen(snapshot.state)).toBe(true);
    expect(Object.isFrozen(snapshot.state.chunks)).toBe(true);
    expect(Object.isFrozen(snapshot.state.lifecycle)).toBe(true);
    expect(Object.isFrozen(snapshot.response)).toBe(true);
    expect(Object.isFrozen(snapshot.summary)).toBe(true);
  });

  it("does not expose provider-specific fields on stream models", async () => {
    const { service, providerId } = createTestStreamingHarness();
    const snapshot = await startStream({
      providerId,
      service,
      createdAt: FIXED_TIMESTAMP,
    });

    const responseKeys = Object.keys(snapshot.response).sort();
    expect(responseKeys).toEqual(
      [
        "chunkCount",
        "completedAt",
        "completion",
        "content",
        "error",
        "id",
        "metrics",
        "providerId",
        "requestId",
        "status",
        "streamId",
        "tokenCount",
      ].sort(),
    );

    expect(snapshot.state.status).toBe(StreamStatuses.COMPLETED);
    expect(
      snapshot.state.lifecycle.events.some(
        (event) => event.type === StreamEventTypes.STREAM_COMPLETED,
      ),
    ).toBe(true);
  });

  it("preserves empty content streams as completed", async () => {
    const { service, providerId } = createTestStreamingHarness({
      chunks: [
        {
          id: "empty-final",
          streamId: "stream:x",
          index: 0,
          delta: "",
          isFinal: true,
          finishReason: "stop",
          createdAt: FIXED_TIMESTAMP,
        },
      ],
    });

    const snapshot = await startStream({
      providerId,
      service,
      createdAt: FIXED_TIMESTAMP,
    });

    expect(snapshot.state.status).toBe(StreamStatuses.COMPLETED);
    expect(snapshot.response.content).toBe("");
    expect(snapshot.state.metrics.chunkCount).toBe(1);
  });
});
