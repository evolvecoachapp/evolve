import { uniqueSorted } from "../utils/NutritionAdaptationHelpers";

export interface NutritionPlan {
  readonly id: string;
  readonly stepKeys: readonly string[];
  readonly targetKeys: readonly string[];
  readonly decisionKeys: readonly string[];
}

/** Deterministic planning structures only — no execution. */
export function planNutrition(input: {
  readonly id: string;
  readonly decisionKeys: readonly string[];
  readonly planKeys: readonly string[];
}): NutritionPlan {
  const stepKeys = uniqueSorted(
    input.decisionKeys.map((k) => `step:nutrition:${k}`),
  );
  const targetKeys = uniqueSorted([
    ...input.planKeys.map((k) => `target:${k}`),
    ...input.decisionKeys.map((k) => `target:decision:${k}`),
  ]);
  return Object.freeze({
    id: `plan:nutrition:${input.id}`,
    stepKeys,
    targetKeys,
    decisionKeys: uniqueSorted(input.decisionKeys),
  });
}
