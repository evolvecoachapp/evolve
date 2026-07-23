import type { ToolCapability } from "./ToolCapability";
import type { ToolCategory } from "./ToolCategory";
import type { ToolMetadata } from "./ToolMetadata";
import type { ToolSchema } from "./ToolSchema";
import { EMPTY_TOOL_SCHEMA } from "./ToolSchema";

/** Immutable catalog entry describing an available tool. */
export interface ToolDefinition {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly category: ToolCategory;
  readonly capabilities: readonly ToolCapability[];
  readonly schema: ToolSchema;
  readonly metadata: ToolMetadata;
}

export function createToolDefinition(input: {
  readonly id?: string;
  readonly name: string;
  readonly description: string;
  readonly category?: ToolCategory;
  readonly capabilities: readonly ToolCapability[];
  readonly schema?: ToolSchema;
  readonly metadata: ToolMetadata;
}): ToolDefinition {
  const name = input.name;
  return Object.freeze({
    id: input.id ?? name,
    name,
    description: input.description,
    category: input.category ?? "domain",
    capabilities: Object.freeze([...input.capabilities]),
    schema: input.schema ?? EMPTY_TOOL_SCHEMA,
    metadata: Object.freeze({
      version: input.metadata.version,
      tags: Object.freeze([...input.metadata.tags]),
      createdAt: input.metadata.createdAt,
    }),
  });
}
