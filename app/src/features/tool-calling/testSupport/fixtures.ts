import type { ToolArgument } from "../models/ToolArgument";
import type { ToolContext } from "../models/ToolContext";
import type { ToolDefinition } from "../models/ToolDefinition";
import type { ToolRequest } from "../models/ToolRequest";
import type { ToolResult } from "../models/ToolResult";
import { ToolError } from "../models/ToolError";

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
  return Object.freeze({
    name: overrides.name ?? "get_athlete_profile",
    description: overrides.description ?? "Load athlete profile",
    capabilities: Object.freeze(
      overrides.capabilities ?? (["athlete_profile"] as const),
    ),
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
