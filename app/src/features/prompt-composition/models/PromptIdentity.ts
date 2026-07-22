/**
 * Structured identity facts for composition.
 * Not a persona prompt string.
 */
export interface PromptIdentity {
  readonly id: string;
  readonly roleCode: string;
  readonly audience: string;
  readonly communicationStyle: string | null;
  readonly statement: string;
  readonly refs: readonly string[];
}
