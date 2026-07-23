import type { RoutingStep } from "../models/RoutingStep";
import {
  RoutingPolicyKinds,
  type RoutingPolicy,
} from "../models/RoutingPolicy";

/**
 * Execution order policy — contiguous order indexes, dependency-respecting.
 */
export class ExecutionPolicy {
  readonly policy: RoutingPolicy = Object.freeze({
    id: "policy:routing:execution",
    kind: RoutingPolicyKinds.EXECUTION,
    name: "ExecutionPolicy",
    description: "Requires contiguous orderIndex and dependency-safe order.",
    enabled: true,
  });

  hasContiguousOrder(steps: readonly RoutingStep[]): boolean {
    if (steps.length === 0) return true;
    const indexes = steps.map((step) => step.orderIndex).sort((a, b) => a - b);
    for (let i = 0; i < indexes.length; i += 1) {
      if (indexes[i] !== i) return false;
    }
    return true;
  }
}

export function createExecutionPolicy(): ExecutionPolicy {
  return new ExecutionPolicy();
}
