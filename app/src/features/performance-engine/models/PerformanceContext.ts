/**
 * Context for a single-session performance analysis.
 * DecisionReport is optional reference metadata only — never used for AI.
 */
export interface PerformanceContext {
  readonly sessionId: string;
  readonly runtimeId: string;
  readonly athleteId: string | null;
  readonly dayId: string | null;
  readonly weekNumber: number | null;
  /** Optional DecisionReport id — reference only, not analyzed. */
  readonly decisionReportId: string | null;
  readonly eventStreamId: string | null;
  readonly eventCount: number;
  readonly analyzedAt: string;
}
