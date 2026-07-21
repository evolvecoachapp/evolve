import type { ConversationMessage } from "../models/ConversationMessage";

/**
 * Sort messages ascending by createdAt, then by id for stable ties.
 */
export function sortMessages(
  messages: readonly ConversationMessage[],
): readonly ConversationMessage[] {
  return Object.freeze(
    [...messages].sort((left, right) => {
      const byTime = left.createdAt.localeCompare(right.createdAt);
      if (byTime !== 0) {
        return byTime;
      }
      return left.id.localeCompare(right.id);
    }),
  );
}
