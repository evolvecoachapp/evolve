/**
 * Immutable Weekly Coach Report recovery section.
 * Composed from Recovery Engine — weekly fatigue, sleep trend, recovery trend.
 * Presentation only. Never invent recovery metrics.
 */
export interface WeeklyRecoveryReport {
  readonly present: boolean;
  readonly status: string | null;
  readonly fatigueScore: number | null;
  readonly sleepLabel: string | null;
  readonly sleepHours: number | null;
  readonly fatigueTrend: string | null;
  readonly sleepTrend: string | null;
  readonly recoveryTrend: string | null;
  readonly signalSummaries: readonly string[];
  readonly summary: string;
}
