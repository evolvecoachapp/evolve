/**
 * Machine-readable reason supporting a domain decision.
 * Codes only — never free-form coaching prose or implementation details.
 */
export interface DecisionReason {
  readonly code: string;
  /** Relative contribution toward the decision (typically 0–1). */
  readonly weight: number;
  /** Optional structured detail code. */
  readonly detail?: string;
}
