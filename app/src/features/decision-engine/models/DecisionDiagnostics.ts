/**
 * Immutable diagnostics — warnings/notes only.
 */
export interface DecisionDiagnostics {
  readonly warnings: readonly string[];
  readonly notes: readonly string[];
  readonly missingSources: readonly string[];
  readonly blockedCandidates: readonly string[];
}
