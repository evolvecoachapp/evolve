import type { ToolContext } from "../models/ToolContext";
import type { ToolRequest } from "../models/ToolRequest";
import type { ToolResult } from "../models/ToolResult";
import type { ToolExecutor } from "../services/ToolExecutor";

/**
 * Thin application wrapper — ConversationService owns the lifecycle.
 */
export async function executeToolRequest(
  executor: ToolExecutor,
  request: ToolRequest,
  context: ToolContext,
): Promise<ToolResult> {
  return executor.execute(request, context);
}
