/**
 * Immutable context window descriptor for a model.
 */
export interface AIContextWindow {
  readonly maxTokens: number;
  readonly maxInputTokens: number | null;
  readonly maxOutputTokens: number | null;
}

export const DEFAULT_CONTEXT_WINDOW: AIContextWindow = Object.freeze({
  maxTokens: 8192,
  maxInputTokens: null,
  maxOutputTokens: null,
});
