export interface WorkoutDiagnostics {
  readonly notes: readonly string[];
  readonly warnings: readonly string[];
  readonly processingSteps: readonly string[];
}
