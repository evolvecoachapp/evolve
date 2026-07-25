import { uniqueSorted } from "../utils/WorkoutAdaptationHelpers";

export interface SessionPlan {
  readonly id: string;
  readonly stepKeys: readonly string[];
  readonly targetKeys: readonly string[];
  readonly sessionKeys: readonly string[];
}

export function planSessions(input: {
  readonly id: string;
  readonly decisionKeys: readonly string[];
  readonly sessionKeys: readonly string[];
}): SessionPlan {
  return Object.freeze({
    id: `plan:session:${input.id}`,
    stepKeys: uniqueSorted(
      input.decisionKeys
        .filter((k) => k.includes("session") || k.includes("frequency"))
        .map((k) => `step:session:${k}`),
    ),
    targetKeys: uniqueSorted(input.sessionKeys.map((k) => `target:${k}`)),
    sessionKeys: uniqueSorted(input.sessionKeys),
  });
}
