import type { CoachPriority } from "./CoachPriority";
import type { CoachReason } from "./CoachReason";

/**
 * Focus area selected from domain knowledge.
 */
export interface CoachFocus {
  readonly id: string;
  readonly area: string;
  readonly statement: string;
  readonly priority: CoachPriority;
  readonly insightIds: readonly string[];
  readonly reason: CoachReason;
}
