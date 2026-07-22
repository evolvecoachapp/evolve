/**
 * Selectable context domains for prompt orchestration.
 *
 * Relative weights and priorities are expressed over these kinds only —
 * never token counts.
 */
export const PROMPT_CONTEXT_KINDS = Object.freeze([
  "conversation",
  "athlete",
  "memory",
  "workout",
  "coach",
] as const);

export type PromptContextKind = (typeof PROMPT_CONTEXT_KINDS)[number];
