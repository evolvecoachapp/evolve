export interface ExplanationMetadata {
  readonly tags: readonly string[];
  readonly attributes: Readonly<Record<string, string>>;
}

export const EMPTY_EXPLANATION_METADATA: ExplanationMetadata = Object.freeze({
  tags: Object.freeze([] as string[]),
  attributes: Object.freeze({} as Record<string, string>),
});
