import type { AIProviderInfo } from "../models/AIProviderInfo";
import type { AIRequest } from "../models/AIRequest";
import type { AIResponse } from "../models/AIResponse";

/**
 * Provider-agnostic LLM interface.
 *
 * Implementations return AIResponse only — no networking in this sprint.
 */
export interface AIProvider {
  generateResponse(request: AIRequest): Promise<AIResponse>;
  healthCheck(): Promise<boolean>;
  getProviderInfo(): AIProviderInfo;
}
