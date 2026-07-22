import type { ConversationAudience } from "./ConversationAudience";
import type { ConversationConstraint } from "./ConversationConstraint";
import type { ConversationEvidence } from "./ConversationEvidence";
import type { ConversationGoal } from "./ConversationGoal";
import type { ConversationIntent } from "./ConversationIntent";
import type { ConversationKnowledge } from "./ConversationKnowledge";
import type { ConversationMessage } from "./ConversationMessage";
import type { ConversationMetadata } from "./ConversationMetadata";
import type { ConversationPreparation } from "./ConversationPreparation";
import type { ConversationRequest } from "./ConversationRequest";
import type { ConversationResponsePlaceholder } from "./ConversationResponsePlaceholder";
import type { ConversationSession } from "./ConversationSession";
import type { ConversationStage } from "./ConversationStage";
import type { ConversationState } from "./ConversationState";
import type { ConversationSummary } from "./ConversationSummary";
import type { ConversationTurn } from "./ConversationTurn";

/**
 * Immutable Conversation Context — primary Conversation Orchestrator output.
 *
 * Structured orchestration facts for Future Prompt Builder / AI Provider layers.
 * Not a prompt. Not AI-generated. Not a conversational reply.
 */
export interface ConversationContext {
  readonly id: string;
  readonly session: ConversationSession;
  readonly audience: ConversationAudience;
  readonly state: ConversationState;
  readonly stage: ConversationStage;
  readonly intent: ConversationIntent;
  readonly goals: readonly ConversationGoal[];
  readonly constraints: readonly ConversationConstraint[];
  readonly evidence: readonly ConversationEvidence[];
  readonly knowledge: ConversationKnowledge;
  readonly messages: readonly ConversationMessage[];
  readonly turns: readonly ConversationTurn[];
  readonly request: ConversationRequest;
  readonly responsePlaceholder: ConversationResponsePlaceholder;
  readonly preparation: ConversationPreparation;
  readonly metadata: ConversationMetadata;
  readonly summary: ConversationSummary;
  readonly frozenAt: string;
}
