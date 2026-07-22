import type { CoachingContext } from "./CoachingContext";
import type { CoachingContextSummary } from "./CoachingContextSummary";

/**
 * Immutable coaching context snapshot — frozen preparation artifact.
 * No persistence. No prompts. Deterministic domain context only.
 */
export interface CoachContextSnapshot {
  readonly id: string;
  readonly context: CoachingContext;
  readonly summary: CoachingContextSummary;
  readonly frozenAt: string;
}
