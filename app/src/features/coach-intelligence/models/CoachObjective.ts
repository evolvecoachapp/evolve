import type { CoachIntent } from "./CoachIntent";
import type { CoachMetadata } from "./CoachMetadata";
import type { CoachPriority } from "./CoachPriority";
import type { CoachReason } from "./CoachReason";

/**
 * Deterministic coaching objective derived from domain knowledge.
 * Structured context for future prompt builders — not advice language.
 */
export interface CoachObjective {
  readonly id: string;
  readonly intent: CoachIntent;
  readonly priority: CoachPriority;
  readonly title: string;
  readonly statement: string;
  readonly reason: CoachReason;
  readonly evidenceIds: readonly string[];
  readonly focusIds: readonly string[];
  readonly metadata: CoachMetadata;
}
