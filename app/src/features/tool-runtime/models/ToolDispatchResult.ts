import type { ToolResult } from "./ToolResult";

/**
 * Immutable result of routing one step through the dispatcher.
 */
export interface ToolDispatchResult {
  readonly stepId: string;
  readonly adapterId: string | null;
  readonly toolId: string | null;
  readonly accepted: boolean;
  readonly reason: string | null;
  readonly result: ToolResult | null;
}
