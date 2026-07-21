import { toAIRequest } from "../toAIRequest";
import { validateAIRequest } from "../validateAIRequest";
import { validateAIResponse } from "../validateAIResponse";
import {
  createAIRequest,
  createAIResponse,
  createConversation,
  createPromptContext,
  FIXED_TIMESTAMP,
} from "../../testSupport/fixtures";

describe("toAIRequest", () => {
  it("maps PromptContext metadata without domain leakage", () => {
    const promptContext = createPromptContext();
    const request = toAIRequest(promptContext);

    expect(request.schemaVersion).toBe(promptContext.metadata.schemaVersion);
    expect(request.consistencyScore).toBe(
      promptContext.athlete.consistencyScore,
    );
    expect(request.insightCount).toBe(promptContext.metadata.insightCount);
    expect(request.riskCount).toBe(promptContext.metadata.riskCount);
    expect(request.recommendationCount).toBe(
      promptContext.metadata.recommendationCount,
    );
    expect(request.promptGeneratedAt).toBe(FIXED_TIMESTAMP);
    expect(request.sectionIds).toEqual(
      promptContext.sections
        .filter((section) => section.included)
        .map((section) => section.id),
    );
    expect(request.messages[0]?.role).toBe("system");
    expect(request.messages[0]?.content).toBe("prompt_context");
  });

  it("appends conversation messages after the system message", () => {
    const request = toAIRequest(
      createPromptContext(),
      createConversation(),
    );

    expect(request.messages).toHaveLength(2);
    expect(request.messages[1]?.role).toBe("user");
    expect(request.conversation?.conversationId).toBe("conv-test-1");
  });
});

describe("validateAIRequest", () => {
  it("accepts a well-formed request", () => {
    expect(validateAIRequest(createAIRequest())).toEqual([]);
  });

  it("reports structural issues", () => {
    const invalid = createAIRequest({
      messages: Object.freeze([]),
      consistencyScore: 1.5,
      schemaVersion: 0,
      insightCount: -1,
      sectionIds: Object.freeze([]),
      conversation: Object.freeze({
        conversationId: "",
        messages: Object.freeze([]),
      }),
    });

    expect(validateAIRequest(invalid)).toEqual(
      expect.arrayContaining([
        "empty_messages",
        "invalid_consistency_score",
        "invalid_schema_version",
        "negative_counts",
        "empty_section_ids",
        "conversation_id_mismatch",
      ]),
    );
  });

  it("flags empty message content", () => {
    const invalid = createAIRequest({
      messages: Object.freeze([
        Object.freeze({
          id: "msg-1",
          role: "user" as const,
          content: "",
          createdAt: FIXED_TIMESTAMP,
        }),
      ]),
    });

    expect(validateAIRequest(invalid)).toContain("invalid_message_content");
  });
});

describe("validateAIResponse", () => {
  it("accepts a well-formed response", () => {
    expect(validateAIResponse(createAIResponse())).toEqual([]);
  });

  it("reports structural issues", () => {
    const invalid = createAIResponse({
      message: Object.freeze({
        id: "",
        role: "user",
        content: "",
        createdAt: "",
      }),
      model: Object.freeze({
        id: "",
        name: "",
        provider: "anthropic",
      }),
      usage: Object.freeze({
        promptTokens: -1,
        completionTokens: 2,
        totalTokens: 1,
      }),
      generatedAt: "",
    });

    expect(validateAIResponse(invalid)).toEqual(
      expect.arrayContaining([
        "invalid_message_id",
        "invalid_message_role",
        "invalid_message_content",
        "invalid_message_timestamp",
        "provider_model_mismatch",
        "missing_model_id",
        "invalid_token_usage",
        "missing_generated_at",
      ]),
    );
  });
});
