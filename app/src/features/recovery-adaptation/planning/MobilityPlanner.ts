import { uniqueSorted } from "../utils/RecoveryAdaptationHelpers";

export interface TimingPlan {
  readonly id: string;
  readonly stepKeys: readonly string[];
  readonly targetKeys: readonly string[];
  readonly mobilityKeys: readonly string[];
}

export function planMobility(input: {
  readonly id: string;
  readonly decisionKeys: readonly string[];
  readonly mobilityKeys: readonly string[];
}): TimingPlan {
  return Object.freeze({
    id: `plan:timing:${input.id}`,
    stepKeys: uniqueSorted(
      input.decisionKeys
        .filter((k) => k.includes("timing") || k.includes("day"))
        .map((k) => `step:timing:${k}`),
    ),
    targetKeys: uniqueSorted(input.mobilityKeys.map((k) => `target:${k}`)),
    mobilityKeys: uniqueSorted(input.mobilityKeys),
  });
}
