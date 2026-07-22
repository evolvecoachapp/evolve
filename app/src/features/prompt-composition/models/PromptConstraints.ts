/**
 * Aggregated constraint facts for composition.
 */
export interface PromptConstraints {
  readonly id: string;
  readonly constraintIds: readonly string[];
  readonly codes: readonly string[];
  readonly statement: string;
}
