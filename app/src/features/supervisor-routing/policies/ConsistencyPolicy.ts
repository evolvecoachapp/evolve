import type { RoutingPlan } from "../models/RoutingPlan";
import {
  RoutingPolicyKinds,
  type RoutingPolicy,
} from "../models/RoutingPolicy";

/**
 * Consistency policy — plan internal referential integrity.
 */
export class ConsistencyPolicy {
  readonly policy: RoutingPolicy = Object.freeze({
    id: "policy:routing:consistency",
    kind: RoutingPolicyKinds.CONSISTENCY,
    name: "ConsistencyPolicy",
    description: "Ensures targets, steps, and graph reference the same subjects.",
    enabled: true,
  });

  isConsistent(plan: RoutingPlan): boolean {
    const targetIds = new Set(plan.targets.map((t) => t.id));
    const stepTargetIds = new Set(plan.steps.map((s) => s.targetId));
    for (const targetId of stepTargetIds) {
      if (!targetIds.has(targetId)) return false;
    }
    if (plan.executionOrder.steps.length !== plan.steps.length) return false;
    if (plan.graph.planId !== plan.id) return false;
    return true;
  }
}

export function createConsistencyPolicy(): ConsistencyPolicy {
  return new ConsistencyPolicy();
}
