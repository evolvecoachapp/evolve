/**
 * Immutable metadata bag for Agent Capability artifacts.
 */
export interface CapabilityMetadata {
  readonly tags: readonly string[];
  readonly attributes: Readonly<Record<string, string>>;
}

export const EMPTY_CAPABILITY_METADATA: CapabilityMetadata = Object.freeze({
  tags: Object.freeze([] as string[]),
  attributes: Object.freeze({} as Record<string, string>),
});
