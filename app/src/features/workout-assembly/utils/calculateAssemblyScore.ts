import type { WorkoutAssemblyScore } from "../models/WorkoutAssemblyScore";

export interface WorkoutAssemblyScoreParts {
  readonly ordering?: number;
  readonly prescription?: number;
  readonly adaptation?: number;
  readonly integrity?: number;
  readonly workload?: number;
}

/**
 * Calculate aggregate assembly score from axis parts.
 */
export function calculateAssemblyScore(
  parts: WorkoutAssemblyScoreParts,
): WorkoutAssemblyScore {
  const ordering = parts.ordering ?? 0;
  const prescription = parts.prescription ?? 0;
  const adaptation = parts.adaptation ?? 0;
  const integrity = parts.integrity ?? 0;
  const workload = parts.workload ?? 0;
  const total = round3(
    ordering + prescription + adaptation + integrity + workload,
  );

  return Object.freeze({
    total,
    ordering: round3(ordering),
    prescription: round3(prescription),
    adaptation: round3(adaptation),
    integrity: round3(integrity),
    workload: round3(workload),
  });
}

export function mergeScoreParts(
  ...partsList: readonly WorkoutAssemblyScoreParts[]
): WorkoutAssemblyScore {
  return calculateAssemblyScore(
    partsList.reduce<WorkoutAssemblyScoreParts>(
      (acc, parts) => ({
        ordering: (acc.ordering ?? 0) + (parts.ordering ?? 0),
        prescription: (acc.prescription ?? 0) + (parts.prescription ?? 0),
        adaptation: (acc.adaptation ?? 0) + (parts.adaptation ?? 0),
        integrity: (acc.integrity ?? 0) + (parts.integrity ?? 0),
        workload: (acc.workload ?? 0) + (parts.workload ?? 0),
      }),
      {},
    ),
  );
}

function round3(value: number): number {
  return Math.round(value * 1000) / 1000;
}
