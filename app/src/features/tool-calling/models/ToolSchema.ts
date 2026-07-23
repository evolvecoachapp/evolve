import type { ToolParameter } from "./ToolParameter";

/** Immutable input/output schema descriptor for a tool. */
export interface ToolSchema {
  readonly parameters: readonly ToolParameter[];
  readonly returns: string | null;
}

export const EMPTY_TOOL_SCHEMA: ToolSchema = Object.freeze({
  parameters: Object.freeze([]),
  returns: null,
});
