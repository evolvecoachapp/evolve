import { uniqueSorted } from "../utils/NutritionAdaptationHelpers";

export interface TimingPlan {
  readonly id: string;
  readonly stepKeys: readonly string[];
  readonly targetKeys: readonly string[];
  readonly timingKeys: readonly string[];
}

export function planTiming(input: {
  readonly id: string;
  readonly decisionKeys: readonly string[];
  readonly timingKeys: readonly string[];
}): TimingPlan {
  return Object.freeze({
    id: `plan:timing:${input.id}`,
    stepKeys: uniqueSorted(
      input.decisionKeys
        .filter((k) => k.includes("timing") || k.includes("meal"))
        .map((k) => `step:timing:${k}`),
    ),
    targetKeys: uniqueSorted(input.timingKeys.map((k) => `target:${k}`)),
    timingKeys: uniqueSorted(input.timingKeys),
  });
}
