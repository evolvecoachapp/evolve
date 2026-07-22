import type { AIResponse } from "./AIResponse";
import type { ToolRequest } from "../../tool-calling/models/ToolRequest";
import type { WorkflowRequest } from "../../workflow/models/WorkflowRequest";

/**
 * Provider generation outcome.
 *
 * Providers may return a normal assistant response, a domain ToolRequest,
 * or a domain WorkflowRequest.
 * EVOLVE (ConversationService + ToolExecutor / WorkflowExecutor) owns
 * execution — never the provider.
 */
export type AIProviderResult = AIResponse | ToolRequest | WorkflowRequest;
