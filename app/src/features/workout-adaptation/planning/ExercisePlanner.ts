import { uniqueSorted } from "../utils/WorkoutAdaptationHelpers";

export interface ExercisePlan {
  readonly id: string;
  readonly stepKeys: readonly string[];
  readonly targetKeys: readonly string[];
  readonly exerciseKeys: readonly string[];
}

export function planExercises(input: {
  readonly id: string;
  readonly decisionKeys: readonly string[];
  readonly exerciseKeys: readonly string[];
}): ExercisePlan {
  const relevant = input.decisionKeys.filter(
    (k) => k.includes("exercise") || k.includes("volume") || k.includes("intensity") || k.includes("progression"),
  );
  return Object.freeze({
    id: `plan:exercise:${input.id}`,
    stepKeys: uniqueSorted(relevant.map((k) => `step:exercise:${k}`)),
    targetKeys: uniqueSorted(input.exerciseKeys.map((k) => `target:${k}`)),
    exerciseKeys: uniqueSorted(input.exerciseKeys),
  });
}
