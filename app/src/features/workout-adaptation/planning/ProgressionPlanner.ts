import { uniqueSorted } from "../utils/WorkoutAdaptationHelpers";

export interface ProgressionPlan {
  readonly id: string;
  readonly stepKeys: readonly string[];
  readonly targetKeys: readonly string[];
}

export function planProgression(input: {
  readonly id: string;
  readonly decisionKeys: readonly string[];
}): ProgressionPlan {
  const keys = input.decisionKeys.filter(
    (k) => k.includes("progression") || k.includes("plateau") || k.includes("regression"),
  );
  return Object.freeze({
    id: `plan:progression:${input.id}`,
    stepKeys: uniqueSorted(keys.map((k) => `step:progression:${k}`)),
    targetKeys: uniqueSorted(keys.map((k) => `target:progression:${k}`)),
  });
}
