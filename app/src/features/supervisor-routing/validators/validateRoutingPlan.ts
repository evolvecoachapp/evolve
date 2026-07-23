import type { RoutingConstraint } from "../models/RoutingConstraint";
import { RoutingConstraintKinds } from "../models/RoutingConstraint";
import type { RoutingPlan } from "../models/RoutingPlan";
import {
  RoutingValidationCodes,
  type RoutingValidation,
  type RoutingValidationIssue,
} from "../models/RoutingValidation";
import { validateConsistency } from "./validateConsistency";
import { validateDependencies } from "./validateDependencies";
import { validateExecutionOrder } from "./validateExecutionOrder";
import { validateGraph } from "./validateGraph";
import { validateUniqueness } from "./validateUniqueness";

function validateConstraints(
  plan: RoutingPlan,
  constraints: readonly RoutingConstraint[],
): RoutingValidation {
  const issues: RoutingValidationIssue[] = [];

  for (const constraint of constraints) {
    if (constraint.kind === RoutingConstraintKinds.FORBID_AGENT) {
      const forbidden = String(constraint.value ?? constraint.subjectId ?? "");
      if (plan.targets.some((t) => t.agentId === forbidden)) {
        issues.push({
          code: RoutingValidationCodes.FORBIDDEN_AGENT,
          message: `Forbidden agent present: ${forbidden}`,
          path: "constraints",
        });
      }
    }
    if (constraint.kind === RoutingConstraintKinds.MAX_TARGETS) {
      const max = Number(constraint.value ?? 0);
      if (Number.isFinite(max) && plan.targets.length > max) {
        issues.push({
          code: RoutingValidationCodes.MAX_TARGETS_EXCEEDED,
          message: `Target count ${plan.targets.length} exceeds max ${max}`,
          path: "constraints",
        });
      }
    }
    if (constraint.kind === RoutingConstraintKinds.REQUIRE_AGENT) {
      const required = String(constraint.value ?? constraint.subjectId ?? "");
      if (required && !plan.targets.some((t) => t.agentId === required)) {
        issues.push({
          code: RoutingValidationCodes.CONSTRAINT_VIOLATION,
          message: `Required agent missing: ${required}`,
          path: "constraints",
        });
      }
    }
  }

  return Object.freeze({
    valid: issues.length === 0,
    issues: Object.freeze(issues.map((issue) => Object.freeze(issue))),
  });
}

/**
 * Full routing plan validation (dependencies, cycles, order, graph, uniqueness).
 */
export function validateRoutingPlan(plan: RoutingPlan): RoutingValidation {
  const nodeIds = plan.capabilities.map((c) => c.capabilityId);
  const parts = [
    validateDependencies({
      nodeIds,
      dependencies: plan.dependencies,
    }),
    validateExecutionOrder(plan.steps),
    validateGraph(plan.graph),
    validateUniqueness(plan),
    validateConsistency(plan),
    validateConstraints(plan, plan.constraints),
  ];

  if (plan.targets.length === 0) {
    parts.push(
      Object.freeze({
        valid: false,
        issues: Object.freeze([
          Object.freeze({
            code: RoutingValidationCodes.EMPTY_PLAN,
            message: "Routing plan has no targets.",
            path: "targets",
          }),
        ]),
      }),
    );
  }

  const issues = parts.flatMap((part) => part.issues);
  return Object.freeze({
    valid: issues.length === 0,
    issues: Object.freeze(issues),
  });
}
