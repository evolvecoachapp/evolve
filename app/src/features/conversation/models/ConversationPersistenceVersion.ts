/**
 * Schema version for durable conversation snapshots.
 *
 * Bump when the snapshot wire format changes incompatibly.
 */
export const CURRENT_CONVERSATION_PERSISTENCE_VERSION = 1 as const;

export type ConversationPersistenceVersion = number;

export function isSupportedConversationPersistenceVersion(
  version: ConversationPersistenceVersion,
): boolean {
  return (
    Number.isInteger(version) &&
    version >= 1 &&
    version <= CURRENT_CONVERSATION_PERSISTENCE_VERSION
  );
}
