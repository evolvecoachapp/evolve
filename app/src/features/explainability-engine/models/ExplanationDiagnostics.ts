export interface ExplanationDiagnostics {
  readonly notes: readonly string[];
  readonly warnings: readonly string[];
  readonly processingSteps: readonly string[];
}
