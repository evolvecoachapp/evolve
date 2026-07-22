import type { ConversationAudience } from "./ConversationAudience";
import type { ConversationIntent } from "./ConversationIntent";
import type { ConversationMetadata } from "./ConversationMetadata";

/**
 * Structured request artifact for Future Prompt Builder.
 * Not a prompt string — ids and orchestration facts only.
 */
export interface ConversationRequest {
  readonly id: string;
  readonly contextId: string;
  readonly audience: ConversationAudience;
  readonly primaryIntent: ConversationIntent | null;
  readonly goalIds: readonly string[];
  readonly constraintIds: readonly string[];
  readonly evidenceIds: readonly string[];
  readonly knowledgeRefs: readonly string[];
  readonly statement: string;
  readonly metadata: ConversationMetadata;
}
