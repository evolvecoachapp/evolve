/**
 * Immutable metadata bag for decision-engine entities.
 */
export interface DecisionMetadata {
  readonly tags: readonly string[];
  readonly attributes: Readonly<Record<string, string>>;
}

export const EMPTY_DECISION_METADATA: DecisionMetadata = Object.freeze({
  tags: Object.freeze([] as string[]),
  attributes: Object.freeze({} as Record<string, string>),
});
