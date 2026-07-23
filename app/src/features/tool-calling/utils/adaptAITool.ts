import type { ITool } from "../contracts/ITool";
import type { ToolArgument } from "../models/ToolArgument";
import type { ToolContext } from "../models/ToolContext";
import { createToolDefinition } from "../models/ToolDefinition";
import type { ToolExecutionContext } from "../models/ToolExecutionContext";
import type { ToolInput } from "../models/ToolInput";
import { EMPTY_TOOL_SCHEMA } from "../models/ToolSchema";
import type { AITool } from "../tools/AITool";
import { normalizeToolId } from "./normalizeToolId";

/** Convert ToolInput parameter map → legacy ToolArgument list. */
export function inputToArguments(input: ToolInput): readonly ToolArgument[] {
  return Object.freeze(
    Object.entries(input.parameters).map(([name, value]) =>
      Object.freeze({ name, value }),
    ),
  );
}

/** Convert legacy ToolArgument list → ToolInput. */
export function argumentsToInput(
  args: readonly ToolArgument[],
): ToolInput {
  const parameters: Record<string, unknown> = {};
  for (const arg of args) {
    parameters[arg.name] = arg.value;
  }
  return Object.freeze({
    parameters: Object.freeze(parameters),
  });
}

/** Map foundation context → legacy ToolContext. */
export function toLegacyToolContext(
  context: ToolExecutionContext,
): ToolContext {
  return Object.freeze({
    conversationId: context.conversationId ?? undefined,
    athleteId: context.athleteId ?? undefined,
    now: context.now,
    metadata: context.attributes,
  });
}

/**
 * Adapt a legacy AITool into the foundation ITool contract.
 */
export function adaptAITool(tool: AITool): ITool {
  const id = normalizeToolId(tool.name());
  const definition = createToolDefinition({
    id,
    name: tool.name(),
    description: tool.description(),
    category: "domain",
    capabilities: tool.capabilities(),
    schema: EMPTY_TOOL_SCHEMA,
    metadata: Object.freeze({
      version: "1.0.0",
      tags: Object.freeze([...tool.capabilities()]),
      createdAt: "1970-01-01T00:00:00.000Z",
    }),
  });

  return {
    id: () => id,
    definition: () => definition,
    validateInput: (input: ToolInput) =>
      tool.validateArguments(inputToArguments(input)),
    execute: async (input, context) =>
      Object.freeze({
        data: await tool.execute(
          inputToArguments(input),
          toLegacyToolContext(context),
        ),
      }),
  };
}
