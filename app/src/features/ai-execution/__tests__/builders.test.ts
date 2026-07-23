import { AIExecutionContextBuilder } from "../builders/AIExecutionContextBuilder";
import { AIExecutionRequestBuilder } from "../builders/AIExecutionRequestBuilder";
import { AIExecutionResultBuilder } from "../builders/AIExecutionResultBuilder";
import { AIExecutionStatuses } from "../models/AIExecutionStatus";
import { createEmptyTrace } from "../models/AIExecutionTrace";
import {
  createAIResponseFixture,
  createPromptPackageFixture,
  FIXED_TIMESTAMP,
} from "../testSupport/fixtures";

describe("ai-execution builders", () => {
  it("builds immutable AIExecutionRequest", () => {
    const request = new AIExecutionRequestBuilder()
      .withId("req-1")
      .withPromptPackage(createPromptPackageFixture())
      .withProviderId("test-provider")
      .withCreatedAt(FIXED_TIMESTAMP)
      .build();

    expect(Object.isFrozen(request)).toBe(true);
    expect(request.providerId).toBe("test-provider");
  });

  it("builds immutable AIExecutionContext", () => {
    const context = new AIExecutionContextBuilder()
      .withId("ctx-1")
      .withRequestId("req-1")
      .withProviderId("test-provider")
      .withPromptPackageId("pkg-1")
      .withPreparedAt(FIXED_TIMESTAMP)
      .build();

    expect(Object.isFrozen(context)).toBe(true);
    expect(context.requestId).toBe("req-1");
  });

  it("builds immutable AIExecutionResult with summary", () => {
    const result = new AIExecutionResultBuilder()
      .withId("exec-1")
      .withRequestId("req-1")
      .withContextId("ctx-1")
      .withProviderId("test-provider")
      .withStatus(AIExecutionStatuses.SUCCEEDED)
      .withResponse(createAIResponseFixture())
      .withTrace(createEmptyTrace("exec-1"))
      .withCompletedAt(FIXED_TIMESTAMP)
      .build();

    expect(Object.isFrozen(result)).toBe(true);
    expect(result.summary.succeeded).toBe(true);
    expect(result.summary.hasResponse).toBe(true);
  });

  it("throws when required request fields are missing", () => {
    expect(() => new AIExecutionRequestBuilder().build()).toThrow(
      /missing required fields/,
    );
  });
});
