import { uniqueSorted } from "../utils/NutritionAdaptationHelpers";

export interface HydrationPlan {
  readonly id: string;
  readonly stepKeys: readonly string[];
  readonly targetKeys: readonly string[];
}

export function planHydration(input: {
  readonly id: string;
  readonly decisionKeys: readonly string[];
  readonly signalKeys: readonly string[];
}): HydrationPlan {
  const keys = uniqueSorted([
    ...input.decisionKeys.filter((k) => k.includes("hydration")),
    ...input.signalKeys.filter((k) => k.includes("hydration")),
  ]);
  return Object.freeze({
    id: `plan:hydration:${input.id}`,
    stepKeys: uniqueSorted(keys.map((k) => `step:hydration:${k}`)),
    targetKeys: uniqueSorted(keys.map((k) => `target:hydration:${k}`)),
  });
}
