import type { CoachPriority } from "./CoachPriority";
import type { CoachReason } from "./CoachReason";

/**
 * Deterministic coaching constraint (e.g. recovery limits).
 * Domain fact — not a conversational warning.
 */
export interface CoachConstraint {
  readonly id: string;
  readonly code: string;
  readonly statement: string;
  readonly sourceType: string;
  readonly sourceId: string;
  readonly priority: CoachPriority;
  readonly reason: CoachReason;
}
