import { uniqueSorted } from "../utils/RecoveryAdaptationHelpers";

export interface DayPlan {
  readonly id: string;
  readonly stepKeys: readonly string[];
  readonly targetKeys: readonly string[];
  readonly sleepKeys: readonly string[];
}

export function planSleep(input: {
  readonly id: string;
  readonly decisionKeys: readonly string[];
  readonly sleepKeys: readonly string[];
}): DayPlan {
  const relevant = input.decisionKeys.filter(
    (k) => k.includes("day") || k.includes("sleep") || k.includes("protocol") || k.includes("timing"),
  );
  return Object.freeze({
    id: `plan:day:${input.id}`,
    stepKeys: uniqueSorted(relevant.map((k) => `step:day:${k}`)),
    targetKeys: uniqueSorted(input.sleepKeys.map((k) => `target:${k}`)),
    sleepKeys: uniqueSorted(input.sleepKeys),
  });
}
