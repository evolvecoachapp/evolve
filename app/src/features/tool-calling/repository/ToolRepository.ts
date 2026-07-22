import type { ToolDefinition } from "../models/ToolDefinition";

/**
 * Catalog store for available tool definitions.
 *
 * No durable persistence in this sprint.
 */
export interface ToolRepository {
  listDefinitions(): Promise<readonly ToolDefinition[]>;
  getDefinition(name: string): Promise<ToolDefinition | null>;
  saveDefinition(definition: ToolDefinition): Promise<ToolDefinition>;
  deleteDefinition(name: string): Promise<boolean>;
}
