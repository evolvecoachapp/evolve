import type { ToolDefinition } from "../models/ToolDefinition";
import type { ToolExecutionContext } from "../models/ToolExecutionContext";
import type { ToolInput } from "../models/ToolInput";
import type { ToolOutput } from "../models/ToolOutput";

/**
 * Provider-independent domain tool contract.
 *
 * Implementations live outside this foundation (future domain tools).
 * No OpenAI / vendor logic.
 */
export interface ITool {
  id(): string;
  definition(): ToolDefinition;
  /** Returns frozen validation issue codes; empty means valid. */
  validateInput(input: ToolInput): readonly string[];
  execute(
    input: ToolInput,
    context: ToolExecutionContext,
  ): Promise<ToolOutput>;
}
