/**
 * Immutable validation result for persistence contract integrity.
 */
export interface PersistenceValidation {
  readonly valid: boolean;
  readonly errors: readonly string[];
}
