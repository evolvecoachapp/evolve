import { ToolCallRequestBuilder } from "../builders/ToolCallRequestBuilder";
import { ToolExecutionContextBuilder } from "../builders/ToolExecutionContextBuilder";
import type { IToolRegistry } from "../contracts/IToolRegistry";
import {
  createToolCallingEngine,
  type ToolCallingEngine,
  type ToolCallingEngineDeps,
} from "../engine/ToolCallingEngine";
import type { ToolCallRequest } from "../models/ToolCallRequest";
import type { ToolDescriptor } from "../models/ToolDescriptor";
import type { ToolEngineResult } from "../models/ToolEngineResult";
import type { ToolExecutionContext } from "../models/ToolExecutionContext";
import type { ToolExecutionMetadata } from "../models/ToolExecutionMetadata";
import { EMPTY_TOOL_EXECUTION_METADATA } from "../models/ToolExecutionMetadata";
import type { ToolRegistrySnapshot } from "../models/ToolRegistrySnapshot";

export interface ExecuteToolInput {
  readonly toolId: string;
  readonly parameters?: Readonly<Record<string, unknown>>;
  readonly context?: Partial<ToolExecutionContext> | ToolExecutionContext;
  readonly metadata?: ToolExecutionMetadata;
  readonly requestId?: string;
  readonly callId?: string;
  readonly createdAt?: string;
}

/**
 * Service facade over ToolCallingEngine.
 * Hides engine / executor internals from application consumers.
 */
export class ToolCallingService {
  private readonly engine: ToolCallingEngine;
  private readonly registry: IToolRegistry;
  private readonly clock: () => string;

  constructor(deps: ToolCallingEngineDeps) {
    this.registry = deps.registry;
    this.clock = deps.clock ?? (() => new Date().toISOString());
    this.engine = createToolCallingEngine(deps);
  }

  getEngine(): ToolCallingEngine {
    return this.engine;
  }

  async executeTool(input: ExecuteToolInput): Promise<ToolEngineResult> {
    const request = this.buildRequest(input);
    return this.engine.execute(request);
  }

  async executeRequest(request: ToolCallRequest): Promise<ToolEngineResult> {
    return this.engine.execute(request);
  }

  listTools(): readonly ToolDescriptor[] {
    return this.engine.listTools();
  }

  describeTool(toolId: string): ToolDescriptor | null {
    return this.engine.describeTool(toolId);
  }

  registrySnapshot(capturedAt?: string): ToolRegistrySnapshot {
    return this.registry.snapshot(capturedAt ?? this.clock());
  }

  private buildRequest(input: ExecuteToolInput): ToolCallRequest {
    const createdAt = input.createdAt ?? this.clock();
    const contextInput = input.context ?? {};
    const context = new ToolExecutionContextBuilder()
      .withConversationId(contextInput.conversationId ?? null)
      .withAthleteId(contextInput.athleteId ?? null)
      .withStreamId(contextInput.streamId ?? null)
      .withExecutionRequestId(contextInput.executionRequestId ?? null)
      .withNow(contextInput.now ?? createdAt)
      .withAttributes(contextInput.attributes ?? {})
      .build();

    return new ToolCallRequestBuilder()
      .withId(input.requestId ?? `tool-req:${input.toolId}:${createdAt}`)
      .withCreatedAt(createdAt)
      .withContext(context)
      .withMetadata(input.metadata ?? EMPTY_TOOL_EXECUTION_METADATA)
      .withToolCall({
        callId: input.callId ?? `call:${input.toolId}`,
        toolId: input.toolId,
        parameters: input.parameters ?? {},
        createdAt,
      })
      .build();
  }
}

export function createToolCallingService(
  deps: ToolCallingEngineDeps,
): ToolCallingService {
  return new ToolCallingService(deps);
}
