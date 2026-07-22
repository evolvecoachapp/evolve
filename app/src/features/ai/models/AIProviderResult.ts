import type { AIResponse } from "./AIResponse";
import type { ToolRequest } from "../../tool-calling/models/ToolRequest";

/**
 * Provider generation outcome.
 *
 * Providers may return a normal assistant response or a domain ToolRequest.
 * EVOLVE (ConversationService + ToolExecutor) owns execution — never the provider.
 */
export type AIProviderResult = AIResponse | ToolRequest;
