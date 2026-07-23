import type { CoordinationPlan } from "../models/CoordinationPlan";
import type { CoordinationStep } from "../models/CoordinationStep";
import { CoordinationStepKinds } from "../models/CoordinationStep";

export function invokeSteps(
  plan: CoordinationPlan,
): readonly CoordinationStep[] {
  return Object.freeze(
    plan.steps.filter((s) => s.kind === CoordinationStepKinds.INVOKE_AGENT),
  );
}

export function stepAgentIds(plan: CoordinationPlan): readonly string[] {
  return Object.freeze(
    invokeSteps(plan)
      .map((s) => s.agentId)
      .filter((id): id is string => id != null),
  );
}
