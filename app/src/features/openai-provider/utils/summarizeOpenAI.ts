import type { OpenAIExecutionResult } from "../models/OpenAIExecutionResult";
import type { OpenAIRequest } from "../models/OpenAIRequest";
import type { OpenAIResponse } from "../models/OpenAIResponse";
import { formatMessageCount, formatModelLabel, formatTokenUsage } from "./formatting";

export function summarizeOpenAIRequest(request: OpenAIRequest): string {
  return `OpenAI request model=${formatModelLabel(request.model)} with ${formatMessageCount(request.messages.length)}.`;
}

export function summarizeOpenAIResponse(response: OpenAIResponse): string {
  return `OpenAI response ${response.id} model=${formatModelLabel(response.model)} (${formatTokenUsage(response.usage)}).`;
}

export function summarizeExecutionResult(result: OpenAIExecutionResult): string {
  return `Executed ${result.requestId} → ${result.response.id} via ${formatModelLabel(result.modelId)}.`;
}
