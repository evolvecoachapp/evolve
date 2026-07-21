import { buildPromptContext } from "../../prompt-builder/utils/buildPromptContext";
import { createSnapshot } from "../../prompt-builder/testSupport/fixtures";
import type { AIRequest } from "../models/AIRequest";
import type { AIResponse } from "../models/AIResponse";
import type { ChatMessage } from "../models/ChatMessage";
import type { ConversationContext } from "../models/ConversationContext";
import type { PromptContext } from "../../prompt-builder/models/PromptContext";

export const FIXED_TIMESTAMP = "2026-07-22T00:00:00.000Z";

export function createPromptContext(
  overrides: {
    readonly generatedAt?: string;
  } = {},
): PromptContext {
  return buildPromptContext(createSnapshot(), {
    generatedAt: overrides.generatedAt ?? FIXED_TIMESTAMP,
  });
}

export function createChatMessage(
  overrides: Partial<ChatMessage> = {},
): ChatMessage {
  return Object.freeze({
    id: "msg-user-1",
    role: "user",
    content: "How should I train today?",
    createdAt: FIXED_TIMESTAMP,
    ...overrides,
  });
}

export function createConversation(
  overrides: Partial<ConversationContext> = {},
): ConversationContext {
  return Object.freeze({
    conversationId: "conv-test-1",
    messages: Object.freeze([createChatMessage()]),
    ...overrides,
  });
}

export function createAIRequest(
  overrides: Partial<AIRequest> = {},
): AIRequest {
  return Object.freeze({
    messages: Object.freeze([
      Object.freeze({
        id: "msg-system-prompt",
        role: "system" as const,
        content: "prompt_context",
        createdAt: FIXED_TIMESTAMP,
      }),
      createChatMessage(),
    ]),
    schemaVersion: 1,
    sectionIds: Object.freeze([
      "athlete",
      "training_summary",
      "volume_trend",
      "frequency_trend",
      "personal_records",
      "risk_flags",
      "recommendations",
      "metadata",
    ]),
    consistencyScore: 0.82,
    insightCount: 2,
    riskCount: 1,
    recommendationCount: 1,
    promptGeneratedAt: FIXED_TIMESTAMP,
    ...overrides,
  });
}

export function createAIResponse(
  overrides: Partial<AIResponse> = {},
): AIResponse {
  return Object.freeze({
    message: Object.freeze({
      id: "msg-stub-openai",
      role: "assistant" as const,
      content: "[OpenAI Stub] Deterministic assistant reply for offline testing.",
      createdAt: FIXED_TIMESTAMP,
    }),
    model: Object.freeze({
      id: "gpt-stub-4o",
      name: "GPT Stub 4o",
      provider: "openai" as const,
    }),
    usage: Object.freeze({
      promptTokens: 24,
      completionTokens: 24,
      totalTokens: 48,
    }),
    provider: "openai" as const,
    generatedAt: FIXED_TIMESTAMP,
    ...overrides,
  });
}
