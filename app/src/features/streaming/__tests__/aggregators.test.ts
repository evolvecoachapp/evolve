import {
  createChunkAggregator,
  createSummaryAggregator,
  createTokenAggregator,
} from "../aggregators";
import { createInitialStreamState } from "../models/StreamState";
import { StreamStatuses } from "../models/StreamStatus";
import { createStreamChunkFixture } from "../testSupport/fixtures";

describe("streaming aggregators", () => {
  it("ChunkAggregator concatenates deltas in index order", () => {
    const aggregator = createChunkAggregator();
    aggregator.add(
      createStreamChunkFixture({ id: "b", index: 1, delta: " world" }),
    );
    aggregator.add(
      createStreamChunkFixture({ id: "a", index: 0, delta: "Hello" }),
    );

    expect(aggregator.getContent()).toBe("Hello world");
    expect(aggregator.getCount()).toBe(2);
    expect(aggregator.getLastIndex()).toBe(1);
  });

  it("TokenAggregator splits chunk deltas", () => {
    const aggregator = createTokenAggregator();
    const tokens = aggregator.addFromChunk(
      createStreamChunkFixture({ delta: "Hello world" }),
    );
    expect(tokens.length).toBeGreaterThanOrEqual(2);
    expect(aggregator.getCount()).toBe(tokens.length);
  });

  it("SummaryAggregator builds summary from state", () => {
    const aggregator = createSummaryAggregator();
    const state = {
      ...createInitialStreamState({
        streamId: "stream:1",
        requestId: "req:1",
      }),
      status: StreamStatuses.COMPLETED,
      metrics: {
        ...createInitialStreamState({
          streamId: "stream:1",
          requestId: "req:1",
        }).metrics,
        chunkCount: 2,
        tokenCount: 3,
        contentLength: 11,
        durationMs: 100,
      },
    };

    const summary = aggregator.summarize(state, "test-provider");
    expect(summary.completed).toBe(true);
    expect(summary.chunkCount).toBe(2);
    expect(summary.providerId).toBe("test-provider");
    expect(Object.isFrozen(summary)).toBe(true);
  });
});
