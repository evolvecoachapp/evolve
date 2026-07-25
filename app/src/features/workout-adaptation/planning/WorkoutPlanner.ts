import { uniqueSorted } from "../utils/WorkoutAdaptationHelpers";

export interface WorkoutPlan {
  readonly id: string;
  readonly stepKeys: readonly string[];
  readonly targetKeys: readonly string[];
  readonly decisionKeys: readonly string[];
}

/** Deterministic planning structures only — no execution. */
export function planWorkout(input: {
  readonly id: string;
  readonly decisionKeys: readonly string[];
  readonly blueprintKeys: readonly string[];
}): WorkoutPlan {
  const stepKeys = uniqueSorted(
    input.decisionKeys.map((k) => `step:workout:${k}`),
  );
  const targetKeys = uniqueSorted([
    ...input.blueprintKeys.map((k) => `target:${k}`),
    ...input.decisionKeys.map((k) => `target:decision:${k}`),
  ]);
  return Object.freeze({
    id: `plan:workout:${input.id}`,
    stepKeys,
    targetKeys,
    decisionKeys: uniqueSorted(input.decisionKeys),
  });
}
