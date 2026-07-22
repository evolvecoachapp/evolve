import type { CoachPriority } from "./CoachPriority";
import type { CoachReason } from "./CoachReason";

/**
 * Structured coaching instruction for future prompt builders.
 * Not a prompt. Not an LLM message. Not conversational text.
 */
export interface CoachInstruction {
  readonly id: string;
  readonly code: string;
  readonly objectiveId: string | null;
  readonly statement: string;
  readonly priority: CoachPriority;
  readonly reason: CoachReason;
  readonly evidenceIds: readonly string[];
}
