import type { CoachAudience } from "./CoachAudience";
import type { CoachCommunicationStyle } from "./CoachCommunicationStyle";
import type { CoachConstraint } from "./CoachConstraint";
import type { CoachEvidence } from "./CoachEvidence";
import type { CoachFocus } from "./CoachFocus";
import type { CoachInstruction } from "./CoachInstruction";
import type { CoachKnowledge } from "./CoachKnowledge";
import type { CoachMetadata } from "./CoachMetadata";
import type { CoachObjective } from "./CoachObjective";
import type { CoachPreparation } from "./CoachPreparation";
import type { CoachSession } from "./CoachSession";
import type { CoachingContextSummary } from "./CoachingContextSummary";

/**
 * Immutable Coaching Context — primary Coach Intelligence preparation output.
 *
 * Structured domain knowledge for future Prompt Builder / AI Provider layers.
 * Not a prompt. Not conversational. Not AI-generated.
 */
export interface CoachingContext {
  readonly id: string;
  readonly session: CoachSession;
  readonly audience: CoachAudience;
  readonly communicationStyle: CoachCommunicationStyle;
  readonly objectives: readonly CoachObjective[];
  readonly constraints: readonly CoachConstraint[];
  readonly instructions: readonly CoachInstruction[];
  readonly focus: readonly CoachFocus[];
  readonly evidence: readonly CoachEvidence[];
  readonly knowledge: CoachKnowledge;
  readonly preparation: CoachPreparation;
  readonly metadata: CoachMetadata;
  readonly summary: CoachingContextSummary;
  readonly frozenAt: string;
}
