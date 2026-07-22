import type { CoachContextSnapshot } from "./CoachContextSnapshot";
import type { CoachingContext } from "./CoachingContext";
import type { CoachingContextSummary } from "./CoachingContextSummary";

/**
 * Frozen Coach Intelligence engine result (Sprint 18.8 preparation pipeline).
 */
export interface CoachEngineResult {
  readonly snapshot: CoachContextSnapshot;
  readonly context: CoachingContext;
  readonly summary: CoachingContextSummary;
  readonly validationIssues: readonly string[];
}
