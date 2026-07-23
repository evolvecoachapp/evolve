import type { ToolCapability } from "../models/ToolCapability";
import type { ToolCategory } from "../models/ToolCategory";
import type { ToolDefinition } from "../models/ToolDefinition";
import type { ToolDescriptor } from "../models/ToolDescriptor";
import type { ToolRegistrySnapshot } from "../models/ToolRegistrySnapshot";
import type { ITool } from "./ITool";

/**
 * Immutable catalog of executable tools (after freeze).
 *
 * Register / resolve / list / validate availability / group by category.
 * No business logic.
 */
export interface IToolRegistry {
  register(tool: ITool): void;
  resolve(toolId: string): ITool | null;
  has(toolId: string): boolean;
  isAvailable(toolId: string): boolean;
  list(): readonly ITool[];
  listDescriptors(): readonly ToolDescriptor[];
  listDefinitions(): readonly ToolDefinition[];
  listByCategory(category: ToolCategory): readonly ITool[];
  listCapabilities(): readonly ToolCapability[];
  snapshot(capturedAt?: string): ToolRegistrySnapshot;
  isFrozen(): boolean;
  freeze(): void;
}
