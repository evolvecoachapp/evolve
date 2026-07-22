/**
 * Aggregate quality score for a workout assembly result.
 * Axes correspond to ordering, prescription fidelity, and adaptation resolution.
 */
export interface WorkoutAssemblyScore {
  readonly total: number;
  readonly ordering: number;
  readonly prescription: number;
  readonly adaptation: number;
  readonly integrity: number;
  readonly workload: number;
}

export function createEmptyWorkoutAssemblyScore(): WorkoutAssemblyScore {
  return Object.freeze({
    total: 0,
    ordering: 0,
    prescription: 0,
    adaptation: 0,
    integrity: 0,
    workload: 0,
  });
}
