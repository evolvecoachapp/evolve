import type { FoundationToolResult } from "../../tool-calling/models/FoundationToolResult";
import type { ToolCallRequest } from "../../tool-calling/models/ToolCallRequest";
import type { ToolDefinition } from "../../tool-calling/models/ToolDefinition";
import type { ToolDescriptor } from "../../tool-calling/models/ToolDescriptor";
import type { DomainToolDomain } from "../models/DomainToolDomain";

/**
 * Domain Tool Adapter contract.
 *
 * Adapters translate ToolCallRequest ↔ domain application APIs.
 * No business logic. No provider logic. Domain remains source of truth.
 */
export interface IDomainToolAdapter {
  /** Stable adapter identity (e.g. `adapter.workout`). */
  id(): string;
  /** Domain family this adapter owns. */
  domain(): DomainToolDomain;
  /** Tool ids this adapter can execute. */
  supportedToolIds(): readonly string[];
  /** Whether this adapter handles the given tool id. */
  canHandle(toolId: string): boolean;
  /** Catalog definition for a supported tool id. */
  definition(toolId: string): ToolDefinition | null;
  /** Lightweight descriptor for a supported tool id. */
  describe(toolId: string): ToolDescriptor | null;
  /** List descriptors for all supported tools. */
  listTools(): readonly ToolDescriptor[];
  /**
   * Execute a ToolCallRequest through domain mapping.
   * Returns immutable FoundationToolResult.
   */
  execute(request: ToolCallRequest): Promise<FoundationToolResult>;
}
