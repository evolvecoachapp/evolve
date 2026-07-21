import type { PromptContext } from "../../prompt-builder/models/PromptContext";
import type { AIRequest } from "../models/AIRequest";
import type { ChatMessage } from "../models/ChatMessage";
import type { ConversationContext } from "../models/ConversationContext";

/**
 * Convert a PromptBuilder PromptContext into a provider-agnostic AIRequest.
 *
 * Maps structured metadata only — no prose, markdown, or domain leakage
 * (Workout / Analytics / Records / Coach Intelligence stay behind PromptBuilder).
 */
export function toAIRequest(
  promptContext: PromptContext,
  conversation?: ConversationContext,
): AIRequest {
  const systemMessage: ChatMessage = Object.freeze({
    id: "msg-system-prompt",
    role: "system",
    content: "prompt_context",
    createdAt: promptContext.metadata.generatedAt,
  });

  const conversationMessages = conversation?.messages ?? [];
  const messages = Object.freeze([systemMessage, ...conversationMessages]);

  return Object.freeze({
    messages,
    conversation,
    schemaVersion: promptContext.metadata.schemaVersion,
    sectionIds: Object.freeze(
      promptContext.sections
        .filter((section) => section.included)
        .map((section) => section.id),
    ),
    consistencyScore: promptContext.athlete.consistencyScore,
    insightCount: promptContext.metadata.insightCount,
    riskCount: promptContext.metadata.riskCount,
    recommendationCount: promptContext.metadata.recommendationCount,
    promptGeneratedAt: promptContext.metadata.generatedAt,
  });
}
