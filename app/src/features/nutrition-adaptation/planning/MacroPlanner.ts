import { uniqueSorted } from "../utils/NutritionAdaptationHelpers";

export interface MacroPlan {
  readonly id: string;
  readonly stepKeys: readonly string[];
  readonly targetKeys: readonly string[];
  readonly macroKeys: readonly string[];
}

export function planMacros(input: {
  readonly id: string;
  readonly decisionKeys: readonly string[];
  readonly macroKeys: readonly string[];
}): MacroPlan {
  const keys = input.decisionKeys.filter(
    (k) =>
      k.includes("macro") ||
      k.includes("protein") ||
      k.includes("carbohydrate") ||
      k.includes("fat") ||
      k.includes("fiber") ||
      k.includes("calorie"),
  );
  return Object.freeze({
    id: `plan:macro:${input.id}`,
    stepKeys: uniqueSorted(keys.map((k) => `step:macro:${k}`)),
    targetKeys: uniqueSorted([
      ...input.macroKeys.map((k) => `target:${k}`),
      ...keys.map((k) => `target:macro:${k}`),
    ]),
    macroKeys: uniqueSorted(input.macroKeys),
  });
}
