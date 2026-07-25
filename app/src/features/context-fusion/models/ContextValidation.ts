import type { ContextIntegrityIssue } from "./ContextIntegrity";

/**
 * Immutable validation report (alias shape for validators/policies).
 */
export interface ContextValidation {
  readonly valid: boolean;
  readonly issues: readonly ContextIntegrityIssue[];
}

export const EMPTY_CONTEXT_VALIDATION: ContextValidation = Object.freeze({
  valid: true,
  issues: Object.freeze([] as ContextIntegrityIssue[]),
});
