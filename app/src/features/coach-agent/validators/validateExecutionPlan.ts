import type { CoachExecutionPlan } from "../models/CoachExecutionPlan";
import type {
  CoachValidation,
  CoachValidationIssue,
} from "../models/CoachValidation";
import { CoachValidationCodes } from "../models/CoachValidation";
import { IMPLEMENTED_SPECIALIST_AGENTS } from "../models/SpecialistAgentKind";
import { freezeValidation } from "../utils/FreezeCoachState";

/**
 * Validates a coaching execution plan.
 */
export function validateExecutionPlan(
  plan: CoachExecutionPlan | null | undefined,
): CoachValidation {
  const issues: CoachValidationIssue[] = [];

  if (!plan) {
    issues.push(
      Object.freeze({
        code: CoachValidationCodes.MISSING_FIELD,
        message: "Execution plan is required.",
        path: "plan",
      }),
    );
    return freezeValidation({ valid: false, issues: Object.freeze(issues) });
  }

  if (!plan.id) {
    issues.push(
      Object.freeze({
        code: CoachValidationCodes.MISSING_FIELD,
        message: "Plan id is required.",
        path: "plan.id",
      }),
    );
  }

  if (!plan.requestId) {
    issues.push(
      Object.freeze({
        code: CoachValidationCodes.MISSING_FIELD,
        message: "Plan requestId is required.",
        path: "plan.requestId",
      }),
    );
  }

  if (plan.steps.length === 0 || plan.agentKinds.length === 0) {
    issues.push(
      Object.freeze({
        code: CoachValidationCodes.EMPTY_PLAN,
        message: "Execution plan must include at least one agent step.",
        path: "plan.steps",
      }),
    );
  }

  const implemented = new Set<string>(IMPLEMENTED_SPECIALIST_AGENTS);
  for (const kind of plan.agentKinds) {
    if (!implemented.has(kind)) {
      issues.push(
        Object.freeze({
          code: CoachValidationCodes.UNSUPPORTED_AGENT,
          message: `Agent ${kind} is not yet invocable by Coach.`,
          path: "plan.agentKinds",
        }),
      );
    }
  }

  return freezeValidation({
    valid: issues.length === 0,
    issues: Object.freeze(issues),
  });
}
