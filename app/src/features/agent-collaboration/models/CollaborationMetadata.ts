/**
 * Immutable metadata bag for Agent Collaboration artifacts.
 */
export interface CollaborationMetadata {
  readonly tags: readonly string[];
  readonly attributes: Readonly<Record<string, string>>;
}

export const EMPTY_COLLABORATION_METADATA: CollaborationMetadata = Object.freeze({
  tags: Object.freeze([] as string[]),
  attributes: Object.freeze({} as Record<string, string>),
});
