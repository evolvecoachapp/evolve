/**
 * Immutable metadata bags for Recovery Agent artifacts.
 */
export interface RecoveryAgentMetadata {
  readonly tags: readonly string[];
  readonly attributes: Readonly<
    Record<string, string | number | boolean | null>
  >;
}

export type RecoveryMetadata = RecoveryAgentMetadata;

export const EMPTY_RECOVERY_AGENT_METADATA: RecoveryAgentMetadata =
  Object.freeze({
    tags: Object.freeze([] as string[]),
    attributes: Object.freeze({} as Record<string, string | number | boolean | null>),
  });

export const EMPTY_RECOVERY_METADATA = EMPTY_RECOVERY_AGENT_METADATA;
