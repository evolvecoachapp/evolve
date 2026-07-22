/**
 * Placeholder for future multi-session trend analysis.
 * Sprint 18.3 supports single-session only — trend is always unavailable.
 */
export interface PerformanceTrend {
  readonly available: false;
  readonly sessionCount: 1;
  readonly message: "single_session_only";
}
