/**
 * Immutable metadata bag for context-fusion entities.
 */
export interface ContextMetadata {
  readonly tags: readonly string[];
  readonly attributes: Readonly<Record<string, string>>;
}

export const EMPTY_CONTEXT_METADATA: ContextMetadata = Object.freeze({
  tags: Object.freeze([] as string[]),
  attributes: Object.freeze({} as Record<string, string>),
});
