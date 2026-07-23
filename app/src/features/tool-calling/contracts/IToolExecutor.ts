import type { FoundationToolResult } from "../models/FoundationToolResult";
import type { ToolCall } from "../models/ToolCall";
import type { ToolExecutionContext } from "../models/ToolExecutionContext";
import type { ITool } from "./ITool";

/**
 * Orchestrates a single tool invocation.
 *
 * No domain business logic — only execute → immutable result.
 */
export interface IToolExecutor {
  execute(
    tool: ITool,
    call: ToolCall,
    context: ToolExecutionContext,
    requestId: string,
  ): Promise<FoundationToolResult>;
}
