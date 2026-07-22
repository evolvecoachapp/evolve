import type { ToolCapability } from "../models/ToolCapability";
import type { ToolDefinition } from "../models/ToolDefinition";
import type { AITool } from "../tools/AITool";

/**
 * Immutable catalog of executable tools.
 *
 * Registration happens before freeze; lookups never mutate.
 */
export interface ToolRegistry {
  /** Register a tool before the registry is frozen. */
  register(tool: AITool): void;
  get(name: string): AITool | null;
  has(name: string): boolean;
  list(): readonly AITool[];
  listDefinitions(): readonly ToolDefinition[];
  listCapabilities(): readonly ToolCapability[];
  /** Whether further registration is blocked. */
  isFrozen(): boolean;
}
