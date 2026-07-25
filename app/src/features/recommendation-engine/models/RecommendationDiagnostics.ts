export interface RecommendationDiagnostics {
  readonly notes: readonly string[];
  readonly warnings: readonly string[];
  readonly blockedIds: readonly string[];
  readonly deferredIds: readonly string[];
  readonly processingSteps: readonly string[];
}
