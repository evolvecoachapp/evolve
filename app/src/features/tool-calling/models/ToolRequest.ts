import type { ToolArgument } from "./ToolArgument";

/**
 * Provider-agnostic request for a domain tool.
 *
 * Emitted by an AIProvider; executed only by EVOLVE (ToolExecutor).
 */
export interface ToolRequest {
  readonly id: string;
  readonly toolName: string;
  readonly arguments: readonly ToolArgument[];
  /** ISO-8601 timestamp. */
  readonly requestedAt: string;
}
