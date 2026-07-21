import type { AIProviderInfo } from "../models/AIProviderInfo";
import type { AIRequest } from "../models/AIRequest";
import type { AIResponse } from "../models/AIResponse";

/**
 * Provider-agnostic LLM interface.
 *
 * Implementations return AIResponse only — never vendor response shapes.
 * Networking, when used, goes through the shared HttpClient.
 */
export interface AIProvider {
  generateResponse(request: AIRequest): Promise<AIResponse>;
  healthCheck(): Promise<boolean>;
  getProviderInfo(): AIProviderInfo;
}
