import {
  cancelStream,
  startStream,
  summarizeStream,
} from "../application";
import {
  createTestStreamingHarness,
  FIXED_TIMESTAMP,
} from "../testSupport/fixtures";
import { StreamStatuses } from "../models/StreamStatus";

describe("streaming application", () => {
  it("startStream returns snapshot via public API", async () => {
    const { service, providerId } = createTestStreamingHarness();

    const snapshot = await startStream({
      providerId,
      service,
      requestId: "app-stream-1",
      createdAt: FIXED_TIMESTAMP,
      executionRequestId: "ai-exec-req:1",
    });

    expect(snapshot.requestId).toBe("app-stream-1");
    expect(snapshot.state.status).toBe(StreamStatuses.COMPLETED);
    expect(snapshot.response.content).toBe("Hello world");
  });

  it("cancelStream returns false for unknown stream", () => {
    const { service } = createTestStreamingHarness();
    expect(
      cancelStream({
        streamId: "stream:unknown",
        service,
      }),
    ).toBe(false);
  });

  it("summarizeStream returns compact summary", async () => {
    const { service, providerId } = createTestStreamingHarness();
    const snapshot = await startStream({
      providerId,
      service,
      createdAt: FIXED_TIMESTAMP,
    });

    const summary = summarizeStream({ snapshot, service });
    expect(summary.completed).toBe(true);
    expect(summary.chunkCount).toBe(2);
    expect(summary.providerId).toBe(providerId);
  });
});
