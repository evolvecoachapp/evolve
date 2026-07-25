/**
 * Immutable diagnostics bag (representation only).
 */
export interface ContextDiagnostics {
  readonly warnings: readonly string[];
  readonly notes: readonly string[];
  readonly missingSources: readonly string[];
}
