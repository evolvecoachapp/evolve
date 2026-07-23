import type { CoordinationPlan } from "../models/CoordinationPlan";
import { CoordinationStepKinds } from "../models/CoordinationStep";
import { sortByOrderIndex } from "../utils/sortHelpers";

export function selectExecutionSteps(plan: CoordinationPlan) {
  return sortByOrderIndex(
    plan.steps.filter((s) => s.kind === CoordinationStepKinds.INVOKE_AGENT),
  );
}

export function createExecutionSelector() {
  return { select: selectExecutionSteps };
}
