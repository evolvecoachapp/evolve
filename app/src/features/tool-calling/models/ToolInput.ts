/** Immutable tool input payload (parameter map). */
export interface ToolInput {
  readonly parameters: Readonly<Record<string, unknown>>;
}

export const EMPTY_TOOL_INPUT: ToolInput = Object.freeze({
  parameters: Object.freeze({}),
});
