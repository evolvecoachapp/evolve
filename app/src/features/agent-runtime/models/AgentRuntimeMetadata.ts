/**
 * Immutable runtime metadata tags / attributes.
 */
export interface AgentRuntimeMetadata {
  readonly tags: readonly string[];
  readonly attributes: Readonly<
    Record<string, string | number | boolean | null>
  >;
}

export const EMPTY_AGENT_RUNTIME_METADATA: AgentRuntimeMetadata = Object.freeze({
  tags: Object.freeze([] as string[]),
  attributes: Object.freeze({}),
});
