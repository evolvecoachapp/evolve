import type { AIProviderInfo } from "../models/AIProviderInfo";
import type { AIProviderResult } from "../models/AIProviderResult";
import type { AIRequest } from "../models/AIRequest";
import type { AIStreamEvent } from "../models/AIStreamEvent";

export interface AIProviderStreamOptions {
  /** Optional abort signal for cooperative stream cancellation. */
  readonly signal?: AbortSignal;
}

/**
 * Provider-agnostic LLM interface.
 *
 * Implementations return AIResponse, ToolRequest, WorkflowRequest, or
 * AIStreamEvent only —
 * never vendor shapes. Providers never execute tools and never know
 * available tool implementations.
 * Networking, when used, goes through the shared HttpClient.
 * Providers without native streaming must still expose streamResponse().
 */
export interface AIProvider {
  generateResponse(request: AIRequest): Promise<AIProviderResult>;
  streamResponse(
    request: AIRequest,
    options?: AIProviderStreamOptions,
  ): AsyncIterable<AIStreamEvent>;
  healthCheck(): Promise<boolean>;
  getProviderInfo(): AIProviderInfo;
}
