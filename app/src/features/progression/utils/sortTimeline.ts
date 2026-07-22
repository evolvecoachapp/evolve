import type { ProgressionStep } from "../models/ProgressionStep";
import { freezeProgressionStep } from "./freezeProgressionPlan";

/**
 * Sort progression steps by week, then prescription order, then exercise id.
 */
export function sortTimeline(
  steps: readonly ProgressionStep[],
): readonly ProgressionStep[] {
  return Object.freeze(
    [...steps]
      .sort(compareStepsByWeekThenOrderThenId)
      .map(freezeProgressionStep),
  );
}

export function compareStepsByWeekThenOrderThenId(
  left: ProgressionStep,
  right: ProgressionStep,
): number {
  if (left.weekNumber !== right.weekNumber) {
    return left.weekNumber - right.weekNumber;
  }
  if (left.prescriptionOrder !== right.prescriptionOrder) {
    return left.prescriptionOrder - right.prescriptionOrder;
  }
  return left.exerciseId.localeCompare(right.exerciseId);
}
