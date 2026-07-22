/**
 * Deterministic reason attribution for coaching context items.
 */
export interface CoachReason {
  readonly code: string;
  readonly statement: string;
  readonly attributes: Readonly<
    Record<string, string | number | boolean | null>
  >;
}
