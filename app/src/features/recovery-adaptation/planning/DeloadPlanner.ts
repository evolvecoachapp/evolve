import { uniqueSorted } from "../utils/RecoveryAdaptationHelpers";

export interface ProtocolPlan {
  readonly id: string;
  readonly stepKeys: readonly string[];
  readonly targetKeys: readonly string[];
  readonly protocolKeys: readonly string[];
}

export function planDeload(input: {
  readonly id: string;
  readonly decisionKeys: readonly string[];
  readonly protocolKeys: readonly string[];
}): ProtocolPlan {
  const keys = input.decisionKeys.filter(
    (k) =>
      k.includes("protocol") ||
      k.includes("fatigue") ||
      k.includes("readiness") ||
      k.includes("fat") ||
      k.includes("cardio") ||
      k.includes("sleep"),
  );
  return Object.freeze({
    id: `plan:protocol:${input.id}`,
    stepKeys: uniqueSorted(keys.map((k) => `step:protocol:${k}`)),
    targetKeys: uniqueSorted([
      ...input.protocolKeys.map((k) => `target:${k}`),
      ...keys.map((k) => `target:protocol:${k}`),
    ]),
    protocolKeys: uniqueSorted(input.protocolKeys),
  });
}
