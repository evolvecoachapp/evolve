import type { CoachSupervisorStatistics } from "./CoachSupervisorStatistics";

/**
 * Immutable human-readable supervisor summary.
 */
export interface CoachSupervisorSummary {
  readonly id: string;
  readonly requestId: string;
  readonly planId: string | null;
  readonly headline: string;
  readonly details: readonly string[];
  readonly statistics: CoachSupervisorStatistics;
  readonly createdAt: string;
}
