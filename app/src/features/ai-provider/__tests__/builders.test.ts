import { AIExecutionContextBuilder } from "../builders/AIExecutionContextBuilder";
import { AIRequestBuilder } from "../builders/AIRequestBuilder";
import { AIResponseBuilder } from "../builders/AIResponseBuilder";
import { AIFinishReasons } from "../models/AIFinishReason";
import {
  createPreparedPromptPackage,
  createStubProvider,
  FIXED_TIMESTAMP,
} from "../testSupport/fixtures";

describe("ai-provider builders", () => {
  it("AIRequestBuilder builds a frozen request from PromptPackage", () => {
    const promptPackage = createPreparedPromptPackage({
      id: "prompt-package:builder",
    });

    const request = new AIRequestBuilder()
      .withId("ai-request:builder")
      .withPromptPackage(promptPackage)
      .withProviderId("test-provider")
      .withModel(
        Object.freeze({
          id: "test-model",
          providerId: "test-provider",
          displayName: "Test Model",
          family: "test",
          version: "1",
        }),
      )
      .withCreatedAt(FIXED_TIMESTAMP)
      .build();

    expect(Object.isFrozen(request)).toBe(true);
    expect(request.promptPackageId).toBe("prompt-package:builder");
    expect(request.promptPackage.blocks.length).toBeGreaterThan(0);
  });

  it("AIExecutionContextBuilder builds a frozen context", () => {
    const promptPackage = createPreparedPromptPackage();
    const request = new AIRequestBuilder()
      .withId("ai-request:ctx")
      .withPromptPackage(promptPackage)
      .withProviderId("test-provider")
      .withCreatedAt(FIXED_TIMESTAMP)
      .build();
    const provider = createStubProvider({ id: "test-provider" }).getInfo();

    const context = new AIExecutionContextBuilder()
      .withId("ai-execution:ctx")
      .withRequest(request)
      .withProvider(provider)
      .withOptions(request.options)
      .withPreparedAt(FIXED_TIMESTAMP)
      .withValidationIssues(Object.freeze(["soft_issue"]))
      .build();

    expect(Object.isFrozen(context)).toBe(true);
    expect(context.providerId).toBe("test-provider");
    expect(context.validationIssues).toContain("soft_issue");
  });

  it("AIResponseBuilder builds a frozen standardized response", () => {
    const response = new AIResponseBuilder()
      .withId("ai-response:1")
      .withRequestId("ai-request:1")
      .withProviderId("test-provider")
      .withModelId("test-model")
      .withContent("Hello")
      .withFinishReason(AIFinishReasons.STOP)
      .withCreatedAt(FIXED_TIMESTAMP)
      .build();

    expect(Object.isFrozen(response)).toBe(true);
    expect(response.content).toBe("Hello");
    expect(response.finishReason).toBe("stop");
  });
});
