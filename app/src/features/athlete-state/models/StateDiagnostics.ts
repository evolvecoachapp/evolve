import type { AthleteMetadata } from "./AthleteMetadata";

/**
 * Immutable diagnostics for athlete state operations.
 */
export interface StateDiagnostics {
  readonly warnings: readonly string[];
  readonly notes: readonly string[];
  readonly metadata: AthleteMetadata;
}
