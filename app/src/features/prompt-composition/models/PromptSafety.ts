/**
 * Structured safety composition facts.
 * Domain safety markers only — not provider guardrail text.
 */
export interface PromptSafety {
  readonly id: string;
  readonly codes: readonly string[];
  readonly constraintIds: readonly string[];
  readonly statement: string;
}
