import type { AdaptationRecommendation } from "../../training-adaptation/models/AdaptationRecommendation";
import type { WorkoutAssemblyScore } from "../models/WorkoutAssemblyScore";
import type { WorkoutExercise } from "../models/WorkoutExercise";
import { calculateAssemblyScore } from "./calculateAssemblyScore";

/**
 * Estimate aggregate assembly score from session structure.
 */
export function estimateAssemblyScore(input: {
  readonly exercises: readonly WorkoutExercise[];
  readonly recommendations: readonly AdaptationRecommendation[];
  readonly validationIssueCount: number;
}): WorkoutAssemblyScore {
  const { exercises, recommendations, validationIssueCount } = input;

  const ordering =
    exercises.length === 0
      ? 0
      : exercises.every(
            (exercise, index) =>
              index === 0 || exercise.order >= (exercises[index - 1]?.order ?? 0),
          )
        ? 1
        : 0.5;

  const prescription = Math.min(1, exercises.length / 10);
  const adaptation = Math.min(
    1,
    recommendations.reduce((sum, entry) => sum + entry.action.magnitude, 0) / 10,
  );
  const integrity = Math.max(0, 1 - validationIssueCount * 0.25);
  const workload = Math.min(
    1,
    exercises.reduce((sum, exercise) => sum + exercise.estimatedWorkload, 0) /
      500,
  );

  return calculateAssemblyScore({
    ordering: round3(ordering),
    prescription: round3(prescription),
    adaptation: round3(adaptation),
    integrity: round3(integrity),
    workload: round3(workload),
  });
}

function round3(value: number): number {
  return Math.round(value * 1000) / 1000;
}
