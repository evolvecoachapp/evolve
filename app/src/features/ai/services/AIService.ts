import type { AIConfiguration } from "../../ai-config/models/AIConfiguration";
import type { PromptContext } from "../../prompt-builder/models/PromptContext";
import { AIError } from "../models/AIError";
import type { AIFinishReason } from "../models/AIFinishReason";
import type { AIResponse } from "../models/AIResponse";
import type { AIStreamChunk } from "../models/AIStreamChunk";
import type { AIStreamEvent } from "../models/AIStreamEvent";
import type { ConversationContext } from "../models/ConversationContext";
import type { TokenUsage } from "../models/TokenUsage";
import type { AIProvider } from "../providers/AIProvider";
import { streamToResponse } from "../utils/streamToResponse";
import { toAIRequest } from "../utils/toAIRequest";
import { validateAIRequest } from "../utils/validateAIRequest";
import { validateAIResponse } from "../utils/validateAIResponse";
import { validateChunk } from "../utils/validateChunk";

export interface AIServiceStreamOptions {
  /** Called for each provider stream event (no UI logic). */
  readonly onEvent?: (event: AIStreamEvent) => void | Promise<void>;
  /** Cooperative cancellation signal. */
  readonly signal?: AbortSignal;
}

/**
 * Provider-agnostic AI orchestration service.
 *
 * Consumes PromptBuilder output (PromptContext), converts it to AIRequest,
 * and delegates generation to the injected AIProvider.
 *
 * AIConfiguration is injected — never loaded from the environment here.
 * Depends only on AIProvider + AIConfiguration — no provider-specific logic,
 * no networking.
 */
export class AIService {
  constructor(
    private readonly provider: AIProvider,
    private readonly configuration: AIConfiguration,
  ) {}

  /** Injected configuration (immutable). */
  getConfiguration(): AIConfiguration {
    return this.configuration;
  }

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

  /**
   * Stream an assistant response, emit chunks, aggregate, and return AIResponse.
   *
   * No UI logic — callers receive events via onEvent and the final AIResponse.
   */
  async streamResponse(
    promptContext: PromptContext,
    conversation?: ConversationContext,
    options: AIServiceStreamOptions = {},
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

    const providerInfo = this.provider.getProviderInfo();
    const chunks: AIStreamChunk[] = [];
    let messageId = `msg-stream-${providerInfo.type}`;
    let finishReason: AIFinishReason = "stop";
    let usage: TokenUsage = Object.freeze({
      promptTokens: 0,
      completionTokens: 0,
      totalTokens: 0,
    });
    let generatedAt = request.promptGeneratedAt;
    let sawDone = false;
    let cancelled = false;

    try {
      for await (const event of this.provider.streamResponse(request, {
        signal: options.signal,
      })) {
        if (options.signal?.aborted) {
          cancelled = true;
        }

        await options.onEvent?.(event);

        switch (event.type) {
          case "start":
            messageId = event.messageId || messageId;
            generatedAt = event.createdAt || generatedAt;
            break;
          case "chunk": {
            const chunkIssues = validateChunk(event.chunk);
            if (chunkIssues.length > 0) {
              throw new AIError(
                "invalid_response",
                `Invalid AI stream chunk: ${chunkIssues.join(",")}`,
                providerInfo.type,
              );
            }
            chunks.push(event.chunk);
            break;
          }
          case "done":
            finishReason = event.finishReason;
            usage = event.usage;
            generatedAt = event.createdAt || generatedAt;
            sawDone = true;
            break;
          case "status":
            if (event.status === "cancelled") {
              cancelled = true;
            }
            break;
          case "error":
            throw new AIError(
              "generation_failed",
              event.message,
              providerInfo.type,
            );
          default:
            break;
        }

        if (cancelled) {
          break;
        }
      }
    } catch (error: unknown) {
      if (error instanceof AIError) {
        throw error;
      }
      throw new AIError(
        "generation_failed",
        error instanceof Error ? error.message : "AI stream failed.",
        providerInfo.type,
      );
    }

    if (cancelled || options.signal?.aborted) {
      throw new AIError(
        "stream_cancelled",
        "AI stream was cancelled.",
        providerInfo.type,
      );
    }

    if (!sawDone) {
      throw new AIError(
        "invalid_response",
        "AI stream ended without a done event.",
        providerInfo.type,
      );
    }

    const response = streamToResponse({
      messageId,
      chunks,
      model: providerInfo.model,
      provider: providerInfo.type,
      finishReason,
      usage,
      generatedAt,
    });

    const responseIssues = validateAIResponse(response);
    if (responseIssues.length > 0) {
      throw new AIError(
        "invalid_response",
        `Invalid AI response: ${responseIssues.join(",")}`,
        providerInfo.type,
      );
    }

    return response;
  }

  /** Proxy health check to the injected provider. */
  async healthCheck(): Promise<boolean> {
    return this.provider.healthCheck();
  }
}
