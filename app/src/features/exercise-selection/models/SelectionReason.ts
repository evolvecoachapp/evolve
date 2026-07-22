/**
 * Structured reason contributing to acceptance, rejection, or ranking.
 * Codes only — never free-form coaching prose.
 */
export interface SelectionReason {
  readonly code: string;
  /** Signed contribution toward the total score (0 for pure filters). */
  readonly weight: number;
  /** Optional structured detail code (e.g. pattern or constraint code). */
  readonly detail?: string;
}
