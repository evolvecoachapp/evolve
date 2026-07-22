/**
 * Structured evidence attached to a domain decision.
 * Evidence is domain data references — never stack traces or internals.
 */
export interface DecisionEvidence {
  readonly code: string;
  readonly source: string;
  readonly value: string | number | boolean | null;
  readonly detail?: string;
}
