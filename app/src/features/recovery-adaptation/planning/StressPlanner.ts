import { uniqueSorted } from "../utils/RecoveryAdaptationHelpers";

export interface StressPlan {
  readonly id: string;
  readonly stepKeys: readonly string[];
  readonly targetKeys: readonly string[];
}

export function planStress(input: {
  readonly id: string;
  readonly decisionKeys: readonly string[];
  readonly signalKeys: readonly string[];
}): StressPlan {
  const keys = uniqueSorted([
    ...input.decisionKeys.filter((k) => k.includes("stress")),
    ...input.signalKeys.filter((k) => k.includes("stress")),
  ]);
  return Object.freeze({
    id: `plan:stress:${input.id}`,
    stepKeys: uniqueSorted(keys.map((k) => `step:stress:${k}`)),
    targetKeys: uniqueSorted(keys.map((k) => `target:stress:${k}`)),
  });
}
