import type { ITool } from "../contracts/ITool";
import { createToolDefinition as buildDefinition } from "../models/ToolDefinition";
import type { ToolArgument } from "../models/ToolArgument";
import type { ToolCallRequest } from "../models/ToolCallRequest";
import type { ToolContext } from "../models/ToolContext";
import type { ToolDefinition } from "../models/ToolDefinition";
import type { ToolExecutionContext } from "../models/ToolExecutionContext";
import type { ToolInput } from "../models/ToolInput";
import type { ToolRequest } from "../models/ToolRequest";
import type { ToolResult } from "../models/ToolResult";
import { ToolError } from "../models/ToolError";
import { EMPTY_TOOL_SCHEMA } from "../models/ToolSchema";
import { ToolCallRequestBuilder } from "../builders/ToolCallRequestBuilder";
import { ToolExecutionContextBuilder } from "../builders/ToolExecutionContextBuilder";
import { FoundationToolRegistry } from "../registry/InMemoryToolRegistry";
import { createToolCallingService } from "../services/ToolCallingService";

export const FIXED_TIMESTAMP = "2026-07-22T12:00:00.000Z";

export function createToolArgument(
  overrides: Partial<ToolArgument> = {},
): ToolArgument {
  return Object.freeze({
    name: overrides.name ?? "limit",
    value: overrides.value ?? 5,
  });
}

export function createToolRequest(
  overrides: Partial<ToolRequest> = {},
): ToolRequest {
  return Object.freeze({
    id: overrides.id ?? "tool-req-1",
    toolName: overrides.toolName ?? "get_athlete_profile",
    arguments: Object.freeze(
      overrides.arguments ? [...overrides.arguments] : [],
    ),
    requestedAt: overrides.requestedAt ?? FIXED_TIMESTAMP,
  });
}

export function createToolContext(
  overrides: Partial<ToolContext> = {},
): ToolContext {
  return Object.freeze({
    conversationId: overrides.conversationId ?? "conv-1",
    athleteId: overrides.athleteId ?? "athlete-1",
    now: overrides.now ?? FIXED_TIMESTAMP,
    metadata: overrides.metadata
      ? Object.freeze({ ...overrides.metadata })
      : undefined,
  });
}

export function createToolDefinition(
  overrides: Partial<ToolDefinition> = {},
): ToolDefinition {
  return buildDefinition({
    id: overrides.id ?? overrides.name ?? "get_athlete_profile",
    name: overrides.name ?? "get_athlete_profile",
    description: overrides.description ?? "Load athlete profile",
    category: overrides.category ?? "domain",
    capabilities: overrides.capabilities ?? (["athlete_profile"] as const),
    schema: overrides.schema ?? EMPTY_TOOL_SCHEMA,
    metadata: Object.freeze({
      version: overrides.metadata?.version ?? "1.0.0",
      tags: Object.freeze(
        overrides.metadata?.tags
          ? [...overrides.metadata.tags]
          : ["athlete_profile"],
      ),
      createdAt: overrides.metadata?.createdAt ?? FIXED_TIMESTAMP,
    }),
  });
}

export function createToolResult(
  overrides: Partial<ToolResult> = {},
): ToolResult {
  return Object.freeze({
    executionId: overrides.executionId ?? "exec-1",
    requestId: overrides.requestId ?? "tool-req-1",
    toolName: overrides.toolName ?? "get_athlete_profile",
    status: overrides.status ?? "succeeded",
    data: overrides.data ?? Object.freeze({ placeholder: true }),
    error: overrides.error ?? null,
    completedAt: overrides.completedAt ?? FIXED_TIMESTAMP,
  });
}

export function createFailedToolResult(
  overrides: Partial<ToolResult> = {},
): ToolResult {
  return createToolResult({
    status: "failed",
    data: null,
    error:
      overrides.error ??
      new ToolError("execution_failed", "Tool failed.", {
        toolName: overrides.toolName ?? "get_athlete_profile",
      }),
    ...overrides,
  });
}

export function createExecutionContext(
  overrides: Partial<ToolExecutionContext> = {},
): ToolExecutionContext {
  return new ToolExecutionContextBuilder()
    .withConversationId(overrides.conversationId ?? "conv-1")
    .withAthleteId(overrides.athleteId ?? "athlete-1")
    .withStreamId(overrides.streamId ?? null)
    .withExecutionRequestId(overrides.executionRequestId ?? null)
    .withNow(overrides.now ?? FIXED_TIMESTAMP)
    .withAttributes(overrides.attributes ?? {})
    .build();
}

export function createToolCallRequest(
  overrides: {
    readonly id?: string;
    readonly toolId?: string;
    readonly parameters?: Readonly<Record<string, unknown>>;
    readonly context?: ToolExecutionContext;
    readonly createdAt?: string;
  } = {},
): ToolCallRequest {
  const createdAt = overrides.createdAt ?? FIXED_TIMESTAMP;
  const toolId = overrides.toolId ?? "echo";
  return new ToolCallRequestBuilder()
    .withId(overrides.id ?? "tool-req:echo")
    .withCreatedAt(createdAt)
    .withContext(overrides.context ?? createExecutionContext({ now: createdAt }))
    .withToolCall({
      toolId,
      parameters: overrides.parameters ?? { message: "hello" },
      createdAt,
    })
    .build();
}

/**
 * Foundation stub tool — not a domain implementation.
 */
export function createEchoTool(
  overrides: {
    readonly id?: string;
    readonly fail?: boolean;
  } = {},
): ITool {
  const id = overrides.id ?? "echo";
  const definition = createToolDefinition({
    id,
    name: id,
    description: "Echo parameters for foundation tests",
    category: "utility",
    capabilities: Object.freeze(["utility"] as const),
    schema: Object.freeze({
      parameters: Object.freeze([
        Object.freeze({
          name: "message",
          type: "string",
          description: "Message to echo",
          required: true,
          defaultValue: null,
        }),
      ]),
      returns: "object",
    }),
  });

  return {
    id: () => id,
    definition: () => definition,
    validateInput: (input: ToolInput) => {
      if (typeof input.parameters.message !== "string") {
        return Object.freeze(["invalid_message"]);
      }
      return Object.freeze([]);
    },
    execute: async (input) => {
      if (overrides.fail) {
        throw new Error("echo failed");
      }
      return Object.freeze({
        data: Object.freeze({ echo: input.parameters.message }),
      });
    },
  };
}

export function createTestToolCallingHarness(
  options: {
    readonly tools?: readonly ITool[];
    readonly freeze?: boolean;
  } = {},
) {
  const registry = new FoundationToolRegistry();
  const tools = options.tools ?? [createEchoTool()];
  for (const tool of tools) {
    registry.register(tool);
  }
  if (options.freeze !== false) {
    registry.freeze();
  }

  const clock = () => FIXED_TIMESTAMP;
  const service = createToolCallingService({ registry, clock });
  return { registry, service, engine: service.getEngine(), clock };
}
