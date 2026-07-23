import type { ToolInput } from "./ToolInput";

/**
 * Immutable tool call requested by an AI provider.
 *
 * The LLM only requests execution — it never runs domain logic.
 */
export interface ToolCall {
  readonly id: string;
  readonly toolId: string;
  readonly input: ToolInput;
  readonly createdAt: string;
}
