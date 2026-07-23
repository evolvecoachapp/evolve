/**
 * Immutable structural reasoning notes (no AI / prompts).
 */
export interface SupervisorReasoning {
  readonly summary: string;
  readonly steps: readonly string[];
  readonly notes: readonly string[];
}

export const EMPTY_SUPERVISOR_REASONING: SupervisorReasoning = Object.freeze({
  summary: "",
  steps: Object.freeze([] as string[]),
  notes: Object.freeze([] as string[]),
});
