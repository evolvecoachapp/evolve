import type { RoutingDependency } from "../models/RoutingDependency";
import {
  RoutingPolicyKinds,
  type RoutingPolicy,
} from "../models/RoutingPolicy";
import { detectCycle } from "../utils/DependencyHelpers";

/**
 * Dependency policy — acyclic required dependencies only.
 */
export class DependencyPolicy {
  readonly policy: RoutingPolicy = Object.freeze({
    id: "policy:routing:dependency",
    kind: RoutingPolicyKinds.DEPENDENCY,
    name: "DependencyPolicy",
    description: "Rejects cyclic dependency graphs.",
    enabled: true,
  });

  isAcyclic(
    nodeIds: readonly string[],
    dependencies: readonly RoutingDependency[],
  ): boolean {
    return !detectCycle(nodeIds, dependencies);
  }

  requiredOnly(
    dependencies: readonly RoutingDependency[],
  ): readonly RoutingDependency[] {
    return Object.freeze(dependencies.filter((dep) => dep.required));
  }
}

export function createDependencyPolicy(): DependencyPolicy {
  return new DependencyPolicy();
}
