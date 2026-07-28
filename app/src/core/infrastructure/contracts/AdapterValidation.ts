/**
 * Immutable validation result for infrastructure adapter integrity.
 */
export interface AdapterValidation {
  readonly valid: boolean;
  readonly errors: readonly string[];
}
