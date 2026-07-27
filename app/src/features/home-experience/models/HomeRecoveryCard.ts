/**
 * Immutable Home recovery card — composed from Recovery Engine + sleep signals.
 * Presentation only. Never invent recovery metrics.
 */
export interface HomeRecoveryCard {
  readonly present: boolean;
  readonly status: string | null;
  readonly fatigueScore: number | null;
  readonly sleepLabel: string | null;
  readonly sleepHours: number | null;
  readonly signalSummaries: readonly string[];
  readonly summary: string;
}
