import type { AIResponse } from "../../ai-provider/models/AIResponse";
import type { OpenAIRequest } from "./OpenAIRequest";
import type { OpenAIResponse } from "./OpenAIResponse";

/**
 * Immutable execution result from the OpenAI provider layer.
 *
 * Carries the standardized AIResponse plus optional mapped artifacts
 * for diagnostics — never exposes SDK objects.
 */
export interface OpenAIExecutionResult {
  readonly requestId: string;
  readonly promptPackageId: string;
  readonly modelId: string;
  readonly openAIRequest: OpenAIRequest;
  readonly openAIResponse: OpenAIResponse;
  readonly response: AIResponse;
  readonly executedAt: string;
}
