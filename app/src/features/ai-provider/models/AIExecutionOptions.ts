/**
 * Immutable execution options for a prepared AI request.
 *
 * Abstraction-level knobs only — no HTTP / SDK settings.
 */
export interface AIExecutionOptions {
  readonly temperature: number | null;
  readonly maxOutputTokens: number | null;
  readonly topP: number | null;
  readonly stopSequences: readonly string[];
  readonly stream: boolean;
  readonly timeoutMs: number | null;
  readonly retryLimit: number | null;
  readonly attributes: Readonly<Record<string, string | number | boolean | null>>;
}

export const DEFAULT_EXECUTION_OPTIONS: AIExecutionOptions = Object.freeze({
  temperature: null,
  maxOutputTokens: null,
  topP: null,
  stopSequences: Object.freeze([] as string[]),
  stream: false,
  timeoutMs: null,
  retryLimit: null,
  attributes: Object.freeze({}),
});
