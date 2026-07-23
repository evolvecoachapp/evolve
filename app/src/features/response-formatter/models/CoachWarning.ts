import type { CoachSeverity } from "./CoachRecommendation";

/**
 * Immutable coach warning.
 */
export interface CoachWarning {
  readonly id: string;
  readonly text: string;
  readonly severity: CoachSeverity;
  readonly code: string | null;
}
