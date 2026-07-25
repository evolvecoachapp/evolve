import { uniqueSorted } from "../utils/RecoveryAdaptationHelpers";

export interface RecoveryPlan {
  readonly id: string;
  readonly stepKeys: readonly string[];
  readonly targetKeys: readonly string[];
  readonly decisionKeys: readonly string[];
}

/** Deterministic planning structures only — no execution. */
export function planRecovery(input: {
  readonly id: string;
  readonly decisionKeys: readonly string[];
  readonly planKeys: readonly string[];
}): RecoveryPlan {
  const stepKeys = uniqueSorted(
    input.decisionKeys.map((k) => `step:recovery:${k}`),
  );
  const targetKeys = uniqueSorted([
    ...input.planKeys.map((k) => `target:${k}`),
    ...input.decisionKeys.map((k) => `target:decision:${k}`),
  ]);
  return Object.freeze({
    id: `plan:recovery:${input.id}`,
    stepKeys,
    targetKeys,
    decisionKeys: uniqueSorted(input.decisionKeys),
  });
}
