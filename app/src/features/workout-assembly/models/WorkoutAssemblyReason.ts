/**
 * Machine-readable reason an assembly decision was made.
 */
export interface WorkoutAssemblyReason {
  readonly code: string;
  readonly weight: number;
  readonly detail?: string;
}
