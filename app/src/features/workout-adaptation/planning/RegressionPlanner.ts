import { uniqueSorted } from "../utils/WorkoutAdaptationHelpers";

export interface RegressionPlan {
  readonly id: string;
  readonly stepKeys: readonly string[];
  readonly targetKeys: readonly string[];
}

export function planRegression(input: {
  readonly id: string;
  readonly decisionKeys: readonly string[];
  readonly signalKeys: readonly string[];
}): RegressionPlan {
  const keys = uniqueSorted([
    ...input.decisionKeys.filter((k) => k.includes("regression") || k.includes("fatigue")),
    ...input.signalKeys.filter((k) => k.includes("fatigue") || k.includes("recovery")),
  ]);
  return Object.freeze({
    id: `plan:regression:${input.id}`,
    stepKeys: uniqueSorted(keys.map((k) => `step:regression:${k}`)),
    targetKeys: uniqueSorted(keys.map((k) => `target:regression:${k}`)),
  });
}
