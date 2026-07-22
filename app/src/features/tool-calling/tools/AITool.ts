import type { ToolArgument } from "../models/ToolArgument";
import type { ToolCapability } from "../models/ToolCapability";
import type { ToolContext } from "../models/ToolContext";

/**
 * Pure domain tool contract.
 *
 * Implementations never talk to AI providers.
 */
export interface AITool {
  name(): string;
  description(): string;
  capabilities(): readonly ToolCapability[];
  /** Returns frozen validation issue codes; empty means valid. */
  validateArguments(args: readonly ToolArgument[]): readonly string[];
  execute(
    args: readonly ToolArgument[],
    context: ToolContext,
  ): Promise<unknown>;
}
