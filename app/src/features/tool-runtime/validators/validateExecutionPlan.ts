import type { AdapterResolver } from "../resolver/AdapterResolver";
import type { ToolExecutionPlan } from "../models/ToolExecutionPlan";
import type { ToolExecutionValidation } from "../models/ToolExecutionValidation";
import { freezeValidation } from "../utils/freezeExecution";
import { validateAdapterAvailability } from "./validateAdapterAvailability";
import { validateDependencies } from "./validateDependencies";
import { validateExecutionIntegrity } from "./validateExecutionIntegrity";
import { validateExecutionOrder } from "./validateExecutionOrder";
import { validatePipelineConsistency } from "./validatePipelineConsistency";

export function validateExecutionPlan(
  plan: ToolExecutionPlan,
  adapterResolver?: AdapterResolver,
): ToolExecutionValidation {
  const issues = Object.freeze([
    ...validateExecutionIntegrity(plan),
    ...validateDependencies(plan),
    ...validateExecutionOrder(plan),
    ...validatePipelineConsistency(plan),
    ...(adapterResolver
      ? validateAdapterAvailability(plan, adapterResolver)
      : []),
  ]);
  return freezeValidation({
    valid: issues.length === 0,
    issues,
  });
}
