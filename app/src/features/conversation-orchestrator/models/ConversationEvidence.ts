import type { ConversationPriority } from "./ConversationPriority";

/**
 * Immutable evidence attribution for conversation context.
 * Source facts only — not AI-generated narrative.
 */
export interface ConversationEvidence {
  readonly id: string;
  readonly sourceType: string;
  readonly sourceId: string;
  readonly statement: string;
  readonly priority: ConversationPriority;
  readonly attributes: Readonly<
    Record<string, string | number | boolean | null>
  >;
}
