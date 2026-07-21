import type { PromptContext } from "../../prompt-builder/models/PromptContext";
import { AIError } from "../models/AIError";
import type { AIResponse } from "../models/AIResponse";
import type { ConversationContext } from "../models/ConversationContext";
import type { AIProvider } from "../providers/AIProvider";
import { toAIRequest } from "../utils/toAIRequest";
import { validateAIRequest } from "../utils/validateAIRequest";
import { validateAIResponse } from "../utils/validateAIResponse";

/**
 * Provider-agnostic AI orchestration service.
 *
 * Consumes PromptBuilder output (PromptContext), converts it to AIRequest,
 * and delegates generation to the injected AIProvider.
 *
 * Depends only on AIProvider — no provider-specific logic, no networking.
 */
export class AIService {
  constructor(private readonly provider: AIProvider) {}

  /**
   * Generate an assistant response from a structured prompt context.
   */
  async generateResponse(
    promptContext: PromptContext,
    conversation?: ConversationContext,
  ): Promise<AIResponse> {
    const request = toAIRequest(promptContext, conversation);
    const requestIssues = validateAIRequest(request);

    if (requestIssues.length > 0) {
      throw new AIError(
        "invalid_request",
        `Invalid AI request: ${requestIssues.join(",")}`,
        this.provider.getProviderInfo().type,
      );
    }

    const response = await this.provider.generateResponse(request);
    const responseIssues = validateAIResponse(response);

    if (responseIssues.length > 0) {
      throw new AIError(
        "invalid_response",
        `Invalid AI response: ${responseIssues.join(",")}`,
        this.provider.getProviderInfo().type,
      );
    }

    return response;
  }

  /** Proxy health check to the injected provider. */
  async healthCheck(): Promise<boolean> {
    return this.provider.healthCheck();
  }
}
