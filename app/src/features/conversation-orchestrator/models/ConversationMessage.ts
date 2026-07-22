import type { ConversationMetadata } from "./ConversationMetadata";
import type { ConversationPriority } from "./ConversationPriority";

/**
 * Structural conversation message placeholder.
 * Role + code + factual statement only — not AI-generated dialogue.
 */
export interface ConversationMessage {
  readonly id: string;
  readonly role: "system" | "athlete" | "coach" | "orchestrator";
  readonly code: string;
  readonly statement: string;
  readonly priority: ConversationPriority;
  readonly goalIds: readonly string[];
  readonly evidenceIds: readonly string[];
  readonly metadata: ConversationMetadata;
}
