import { uniqueSorted } from "../utils/NutritionAdaptationHelpers";

export interface WeekPlan {
  readonly id: string;
  readonly stepKeys: readonly string[];
  readonly targetKeys: readonly string[];
  readonly weekKeys: readonly string[];
}

export function planWeeks(input: {
  readonly id: string;
  readonly decisionKeys: readonly string[];
  readonly weekKeys: readonly string[];
}): WeekPlan {
  return Object.freeze({
    id: `plan:week:${input.id}`,
    stepKeys: uniqueSorted(
      input.decisionKeys
        .filter(
          (k) =>
            k.includes("week") ||
            k.includes("refeed") ||
            k.includes("diet-break") ||
            k.includes("calorie"),
        )
        .map((k) => `step:week:${k}`),
    ),
    targetKeys: uniqueSorted(input.weekKeys.map((k) => `target:${k}`)),
    weekKeys: uniqueSorted(input.weekKeys),
  });
}
