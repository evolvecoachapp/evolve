/** Immutable recovery summary for Home. */
export interface RecoverySummaryCard {
  readonly present: boolean;
  readonly score: number;
  readonly status: string;
  readonly tip: string;
}
