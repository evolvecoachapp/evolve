import type { ToolCapability } from "./ToolCapability";
import type { ToolMetadata } from "./ToolMetadata";

/** Immutable catalog entry describing an available tool. */
export interface ToolDefinition {
  readonly name: string;
  readonly description: string;
  readonly capabilities: readonly ToolCapability[];
  readonly metadata: ToolMetadata;
}
