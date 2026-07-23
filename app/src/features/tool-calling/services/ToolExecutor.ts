import type { ToolContext } from "../models/ToolContext";
import type { ToolExecution } from "../models/ToolExecution";
import { ToolError } from "../models/ToolError";
import type { ToolRequest } from "../models/ToolRequest";
import type { ToolResult } from "../models/ToolResult";
import type { ToolRegistry } from "../registry/ToolRegistry";
import { deepCloneToolRequest } from "../utils/deepCloneToolRequest";
import { normalizeArguments } from "../utils/normalizeArguments";
import { validateArguments } from "../validators/validateArguments";
import { validateRequest } from "../validators/validateRequest";
import { validateResult } from "../validators/validateResult";

/**
 * Resolves and executes ToolRequests against the domain ToolRegistry.
 *
 * Never talks to AI providers. Never performs networking.
 */
export class ToolExecutor {
  constructor(private readonly registry: ToolRegistry) {}

  /**
   * Validate → resolve → execute → return ToolResult.
   */
  async execute(
    request: ToolRequest,
    context: ToolContext,
  ): Promise<ToolResult> {
    const cloned = deepCloneToolRequest(request);
    const requestIssues = validateRequest(cloned);
    if (requestIssues.length > 0) {
      throw new ToolError(
        "invalid_request",
        `Invalid tool request: ${requestIssues.join(",")}`,
        { issues: requestIssues, requestId: cloned.id },
      );
    }

    const tool = this.registry.get(cloned.toolName);
    if (!tool) {
      throw new ToolError(
        "tool_not_found",
        `Tool not found: ${cloned.toolName}`,
        { toolName: cloned.toolName, requestId: cloned.id },
      );
    }

    const normalizedArgs = normalizeArguments(cloned.arguments);
    const argumentIssues = validateArguments(normalizedArgs, tool);
    if (argumentIssues.length > 0) {
      return freezeResult({
        executionId: createId("exec"),
        requestId: cloned.id,
        toolName: cloned.toolName,
        status: "failed",
        data: null,
        error: new ToolError(
          "invalid_arguments",
          `Invalid tool arguments: ${argumentIssues.join(",")}`,
          {
            issues: argumentIssues,
            toolIssues: tool.validateArguments(normalizedArgs),
            requestId: cloned.id,
          },
        ),
        completedAt: context.now,
      });
    }

    const execution: ToolExecution = Object.freeze({
      id: createId("exec"),
      requestId: cloned.id,
      callId: cloned.id,
      toolId: cloned.toolName,
      toolName: cloned.toolName,
      status: "running",
      context: null,
      startedAt: context.now,
      completedAt: null,
      result: null,
    });

    try {
      const data = await tool.execute(normalizedArgs, context);
      const result = freezeResult({
        executionId: execution.id,
        requestId: cloned.id,
        toolName: cloned.toolName,
        status: "succeeded",
        data,
        error: null,
        completedAt: context.now,
      });

      const resultIssues = validateResult(result);
      if (resultIssues.length > 0) {
        throw new ToolError(
          "invalid_result",
          `Invalid tool result: ${resultIssues.join(",")}`,
          { issues: resultIssues, requestId: cloned.id },
        );
      }

      return result;
    } catch (error: unknown) {
      if (error instanceof ToolError && error.code === "invalid_result") {
        throw error;
      }

      const toolError =
        error instanceof ToolError
          ? error
          : new ToolError(
              "execution_failed",
              error instanceof Error ? error.message : "Tool execution failed.",
              {
                toolName: cloned.toolName,
                requestId: cloned.id,
              },
            );

      return freezeResult({
        executionId: execution.id,
        requestId: cloned.id,
        toolName: cloned.toolName,
        status: "failed",
        data: null,
        error: toolError,
        completedAt: context.now,
      });
    }
  }
}

function freezeResult(result: ToolResult): ToolResult {
  return Object.freeze({
    ...result,
    error: result.error,
  });
}

function createId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID()}`;
}
