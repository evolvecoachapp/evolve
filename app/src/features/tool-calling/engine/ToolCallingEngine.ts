import type { IToolExecutor } from "../contracts/IToolExecutor";
import type { IToolRegistry } from "../contracts/IToolRegistry";
import { createFoundationToolExecutor } from "../executor/ToolExecutor";
import type { ToolCallRequest } from "../models/ToolCallRequest";
import type { ToolCallResponse } from "../models/ToolCallResponse";
import type { ToolDescriptor } from "../models/ToolDescriptor";
import type { ToolEngineResult } from "../models/ToolEngineResult";
import type { ToolExecution } from "../models/ToolExecution";
import { createToolExecutionError } from "../models/ToolExecutionError";
import type { ToolExecutionResult } from "../models/ToolExecutionResult";
import {
  freezeCallResponse,
  freezeEngineResult,
  freezeExecution,
  freezeExecutionResult,
} from "../utils/freezeObjects";
import { validateCallRequest } from "../validators/validateCallRequest";
import { validateExecutionResult } from "../validators/validateExecutionResult";
import { validateParameters } from "../validators/validateParameters";

export interface ToolCallingEngineDeps {
  readonly registry: IToolRegistry;
  readonly executor?: IToolExecutor;
  readonly clock?: () => string;
}

/**
 * Tool Calling Engine — provider-independent tool execution coordination.
 *
 * Validate request → resolve tool → prepare context → invoke executor →
 * collect result.
 *
 * No provider-specific logic. No domain business logic.
 */
export class ToolCallingEngine {
  private readonly registry: IToolRegistry;
  private readonly executor: IToolExecutor;
  private readonly clock: () => string;

  constructor(deps: ToolCallingEngineDeps) {
    this.registry = deps.registry;
    this.executor =
      deps.executor ?? createFoundationToolExecutor({ clock: deps.clock });
    this.clock = deps.clock ?? (() => new Date().toISOString());
  }

  /**
   * Execute a tool call request through the foundation pipeline.
   */
  async execute(request: ToolCallRequest): Promise<ToolEngineResult> {
    const validationIssues = [...validateCallRequest(request)];

    if (validationIssues.length > 0) {
      return this.buildFailedResult(
        request,
        createToolExecutionError(
          "invalid_request",
          "Tool call request invalid",
          { issues: validationIssues },
        ),
        validationIssues,
        null,
      );
    }

    const tool = this.registry.resolve(request.call.toolId);
    if (!tool) {
      return this.buildFailedResult(
        request,
        createToolExecutionError(
          "tool_not_found",
          `Tool not found: ${request.call.toolId}`,
          { toolId: request.call.toolId },
        ),
        ["tool_not_found"],
        null,
      );
    }

    if (!this.registry.isAvailable(request.call.toolId)) {
      return this.buildFailedResult(
        request,
        createToolExecutionError(
          "tool_unavailable",
          `Tool unavailable: ${request.call.toolId}`,
          { toolId: request.call.toolId },
        ),
        ["tool_unavailable"],
        this.toDescriptor(tool.definition().id, tool),
      );
    }

    const definition = tool.definition();
    const parameterIssues = validateParameters(
      request.call.input,
      definition.schema,
    );
    if (parameterIssues.length > 0) {
      return this.buildFailedResult(
        request,
        createToolExecutionError(
          "invalid_parameters",
          "Tool parameters invalid",
          { issues: parameterIssues },
        ),
        [...parameterIssues],
        this.toDescriptor(definition.id, tool),
      );
    }

    const context = Object.freeze({
      ...request.context,
      now: request.context.now || this.clock(),
      attributes: Object.freeze({ ...request.context.attributes }),
    });

    const foundationResult = await this.executor.execute(
      tool,
      request.call,
      context,
      request.id,
    );

    const executionResult = freezeExecutionResult({
      output: foundationResult.output,
      error: foundationResult.error,
      status: foundationResult.status,
      durationMs: foundationResult.durationMs,
    });

    const resultIssues = validateExecutionResult(executionResult);
    const allIssues = [...validationIssues, ...resultIssues];

    const execution = freezeExecution({
      id: foundationResult.executionId,
      requestId: request.id,
      callId: request.call.id,
      toolId: tool.id(),
      toolName: tool.id(),
      status: foundationResult.status,
      context,
      startedAt: request.createdAt,
      completedAt: foundationResult.completedAt,
      result: executionResult,
    });

    const response = freezeCallResponse({
      requestId: request.id,
      callId: request.call.id,
      toolId: tool.id(),
      status: foundationResult.status,
      result: executionResult,
      completedAt: foundationResult.completedAt,
    });

    return freezeEngineResult({
      request,
      response,
      execution,
      result: executionResult,
      descriptor: this.toDescriptor(tool.id(), tool),
      validationIssues: allIssues,
    });
  }

  listTools(): readonly ToolDescriptor[] {
    return this.registry.listDescriptors();
  }

  describeTool(toolId: string): ToolDescriptor | null {
    const tool = this.registry.resolve(toolId);
    if (!tool) {
      return null;
    }
    return this.toDescriptor(tool.id(), tool);
  }

  private toDescriptor(
    id: string,
    tool: { definition(): { name: string; description: string; category: ToolDescriptor["category"]; capabilities: ToolDescriptor["capabilities"] } },
  ): ToolDescriptor {
    const def = tool.definition();
    return Object.freeze({
      id,
      name: def.name,
      description: def.description,
      category: def.category,
      capabilities: Object.freeze([...def.capabilities]),
    });
  }

  private buildFailedResult(
    request: ToolCallRequest,
    error: ReturnType<typeof createToolExecutionError>,
    validationIssues: readonly string[],
    descriptor: ToolDescriptor | null,
  ): ToolEngineResult {
    const completedAt = request.context.now || this.clock();
    const executionResult: ToolExecutionResult = freezeExecutionResult({
      output: null,
      error,
      status: "failed",
      durationMs: 0,
    });

    const execution: ToolExecution = freezeExecution({
      id: `exec:${request.call.id}`,
      requestId: request.id,
      callId: request.call.id,
      toolId: request.call.toolId,
      toolName: request.call.toolId,
      status: "failed",
      context: request.context,
      startedAt: request.createdAt,
      completedAt,
      result: executionResult,
    });

    const response: ToolCallResponse = freezeCallResponse({
      requestId: request.id,
      callId: request.call.id,
      toolId: request.call.toolId,
      status: "failed",
      result: executionResult,
      completedAt,
    });

    return freezeEngineResult({
      request,
      response,
      execution,
      result: executionResult,
      descriptor,
      validationIssues,
    });
  }
}

export function createToolCallingEngine(
  deps: ToolCallingEngineDeps,
): ToolCallingEngine {
  return new ToolCallingEngine(deps);
}
