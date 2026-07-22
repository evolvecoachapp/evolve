import type { PromptOrchestrationResult } from "../models/PromptOrchestrationResult";
import type { PromptRequest } from "../models/PromptRequest";
import type { PromptOrchestrator } from "../services/PromptOrchestrator";

/**
 * Application use-case: compose prompt context for a user message.
 */
export async function orchestratePrompt(
  orchestrator: PromptOrchestrator,
  request: PromptRequest,
): Promise<PromptOrchestrationResult> {
  return orchestrator.orchestrate(request);
}
