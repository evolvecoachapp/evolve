/**
 * Deterministic reason describing why an insight was emitted.
 * Factual only — never a recommendation or coaching directive.
 */
export interface InsightReason {
  readonly code: string;
  readonly statement: string;
  readonly attributes: Readonly<
    Record<string, string | number | boolean | null>
  >;
}
