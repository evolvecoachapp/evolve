/**
 * Immutable metadata bag for Conversation Memory artifacts.
 */
export interface MemoryMetadata {
  readonly tags: readonly string[];
  readonly attributes: Readonly<Record<string, string>>;
}

export const EMPTY_MEMORY_METADATA: MemoryMetadata = Object.freeze({
  tags: Object.freeze([] as string[]),
  attributes: Object.freeze({} as Record<string, string>),
});
