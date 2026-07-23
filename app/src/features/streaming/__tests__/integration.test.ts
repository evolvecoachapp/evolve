import {
  createStubExecutor,
  createExecutorResolver,
  createExecutionRequestFixture,
  createTestExecutionHarness,
  FIXED_TIMESTAMP as EXEC_FIXED,
} from "../../ai-execution/testSupport/fixtures";
import { executeAI } from "../../ai-execution/application";
import { createPromptPackageFixture } from "../../ai-provider/testSupport/fixtures";
import { startStream, summarizeStream } from "../application";
import {
  createTestStreamingHarness,
  FIXED_TIMESTAMP,
} from "../testSupport/fixtures";
import { StreamStatuses } from "../models/StreamStatus";

describe("streaming integration", () => {
  it("links stream request to AI Execution Pipeline request id", async () => {
    const execution = createTestExecutionHarness();
    const execResult = await executeAI({
      promptPackage: createPromptPackageFixture(),
      providerId: execution.providerId,
      service: execution.service,
      requestId: "ai-exec-req:stream-link",
      createdAt: EXEC_FIXED,
    });

    expect(execResult.status).toBe("succeeded");

    const streaming = createTestStreamingHarness({
      providerId: execution.providerId,
    });

    const snapshot = await startStream({
      providerId: streaming.providerId,
      service: streaming.service,
      executionRequestId: execResult.requestId,
      requestId: "stream-req:linked",
      createdAt: FIXED_TIMESTAMP,
    });

    expect(snapshot.state.requestId).toBe("stream-req:linked");
    // execution link is on the request; snapshot carries completed stream
    expect(snapshot.state.status).toBe(StreamStatuses.COMPLETED);
    expect(snapshot.summary.completed).toBe(true);

    const summary = summarizeStream({
      snapshot,
      service: streaming.service,
    });
    expect(summary.streamId).toBe(snapshot.streamId);
  });

  it("consumes AI Provider Abstraction provider id without provider SDK", async () => {
    const { service, providerId } = createTestStreamingHarness({
      providerId: "stub-provider",
    });

    // Ensure AI execution fixtures / resolvers remain usable in the same suite
    const executor = createStubExecutor({ providerId });
    const resolver = createExecutorResolver([executor]);
    expect(resolver.resolve(providerId)?.providerId).toBe(providerId);

    const request = createExecutionRequestFixture({ providerId });
    expect(request.providerId).toBe(providerId);

    const snapshot = await startStream({
      providerId,
      service,
      executionRequestId: request.id,
      createdAt: FIXED_TIMESTAMP,
    });

    expect(snapshot.providerId).toBe(providerId);
    expect(snapshot.response.content.length).toBeGreaterThan(0);
    expect(Object.isFrozen(snapshot.response)).toBe(true);
  });
});
