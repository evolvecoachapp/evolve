import type { ITool } from "../contracts/ITool";
import type { IToolExecutor } from "../contracts/IToolExecutor";
import type { FoundationToolResult } from "../models/FoundationToolResult";
import type { ToolCall } from "../models/ToolCall";
import { createToolExecutionError } from "../models/ToolExecutionError";
import type { ToolExecutionContext } from "../models/ToolExecutionContext";
import {
  freezeFoundationResult,
} from "../utils/freezeObjects";
import { validateParameters } from "../validators/validateParameters";
import { validateSchema } from "../validators/validateSchema";

export interface FoundationToolExecutorDeps {
  readonly clock?: () => string;
  readonly nowMs?: () => number;
}

/**
 * Tool Executor — orchestration only.
 *
 * Execute tool → return immutable FoundationToolResult.
 * No domain implementation. No provider-specific logic.
 */
export class FoundationToolExecutor implements IToolExecutor {
  private readonly clock: () => string;
  private readonly nowMs: () => number;

  constructor(deps: FoundationToolExecutorDeps = {}) {
    this.clock = deps.clock ?? (() => new Date().toISOString());
    this.nowMs = deps.nowMs ?? (() => Date.now());
  }

  async execute(
    tool: ITool,
    call: ToolCall,
    context: ToolExecutionContext,
    requestId: string,
  ): Promise<FoundationToolResult> {
    const executionId = `exec:${call.id}`;
    const startedMs = this.nowMs();
    const definition = tool.definition();

    const schemaIssues = validateSchema(definition.schema);
    const parameterIssues = validateParameters(call.input, definition.schema);
    const toolInputIssues = tool.validateInput(call.input);
    const allIssues = [
      ...schemaIssues,
      ...parameterIssues,
      ...toolInputIssues,
    ];

    if (allIssues.length > 0) {
      return freezeFoundationResult({
        executionId,
        requestId,
        callId: call.id,
        toolId: tool.id(),
        output: null,
        error: createToolExecutionError(
          "invalid_parameters",
          "Tool parameters invalid",
          { issues: allIssues },
        ),
        status: "failed",
        durationMs: this.nowMs() - startedMs,
        completedAt: context.now || this.clock(),
      });
    }

    try {
      const output = await tool.execute(call.input, context);
      return freezeFoundationResult({
        executionId,
        requestId,
        callId: call.id,
        toolId: tool.id(),
        output: Object.freeze({ data: output.data }),
        error: null,
        status: "succeeded",
        durationMs: this.nowMs() - startedMs,
        completedAt: context.now || this.clock(),
      });
    } catch (error: unknown) {
      return freezeFoundationResult({
        executionId,
        requestId,
        callId: call.id,
        toolId: tool.id(),
        output: null,
        error: createToolExecutionError(
          "execution_failed",
          error instanceof Error ? error.message : "Tool execution failed",
          {
            toolId: tool.id(),
            requestId,
          },
        ),
        status: "failed",
        durationMs: this.nowMs() - startedMs,
        completedAt: context.now || this.clock(),
      });
    }
  }
}

export function createFoundationToolExecutor(
  deps: FoundationToolExecutorDeps = {},
): FoundationToolExecutor {
  return new FoundationToolExecutor(deps);
}
