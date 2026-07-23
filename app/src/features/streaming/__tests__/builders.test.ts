import {
  StreamRequestBuilder,
  StreamStateBuilder,
  StreamSummaryBuilder,
} from "../builders";
import { StreamStatuses } from "../models/StreamStatus";
import { FIXED_TIMESTAMP } from "../testSupport/fixtures";

describe("streaming builders", () => {
  it("StreamRequestBuilder builds frozen request", () => {
    const request = new StreamRequestBuilder()
      .withId("stream-req:1")
      .withProviderId("test-provider")
      .withExecutionRequestId("ai-exec-req:1")
      .withCreatedAt(FIXED_TIMESTAMP)
      .build();

    expect(request.id).toBe("stream-req:1");
    expect(request.executionRequestId).toBe("ai-exec-req:1");
    expect(Object.isFrozen(request)).toBe(true);
  });

  it("StreamRequestBuilder requires fields", () => {
    expect(() => new StreamRequestBuilder().build()).toThrow(
      /missing required fields/,
    );
  });

  it("StreamStateBuilder builds frozen state", () => {
    const state = new StreamStateBuilder()
      .withStreamId("stream:1")
      .withRequestId("stream-req:1")
      .withStatus(StreamStatuses.STREAMING)
      .withContent("partial")
      .build();

    expect(state.content).toBe("partial");
    expect(Object.isFrozen(state)).toBe(true);
  });

  it("StreamSummaryBuilder builds frozen summary", () => {
    const summary = new StreamSummaryBuilder()
      .withStreamId("stream:1")
      .withRequestId("stream-req:1")
      .withStatus(StreamStatuses.COMPLETED)
      .withChunkCount(2)
      .withTokenCount(4)
      .withContentLength(10)
      .build();

    expect(summary.completed).toBe(true);
    expect(summary.chunkCount).toBe(2);
    expect(Object.isFrozen(summary)).toBe(true);
  });
});
