/**
 * Immutable evidence backing a history entry.
 * Extensible attribute bag — no domain-specific coupling.
 */
export interface HistoryEvidence {
  readonly sourceType: string;
  readonly sourceId: string;
  readonly attributes: Readonly<
    Record<string, string | number | boolean | null>
  >;
}
