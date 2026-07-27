/**
 * Immutable Daily Brief recovery section — composed from Recovery Engine + sleep.
 * Presentation only. Never invent recovery metrics.
 */
export interface DailyBriefRecovery {
  readonly present: boolean;
  readonly status: string | null;
  readonly fatigueScore: number | null;
  readonly sleepLabel: string | null;
  readonly sleepHours: number | null;
  readonly signalSummaries: readonly string[];
  readonly summary: string;
}
