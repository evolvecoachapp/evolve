import type { RoutingCapability } from "../models/RoutingCapability";
import type { RoutingDecision } from "../models/RoutingDecision";
import type { RoutingDependency } from "../models/RoutingDependency";
import type { RoutingEdge } from "../models/RoutingEdge";
import type { RoutingNode } from "../models/RoutingNode";
import type { RoutingStep } from "../models/RoutingStep";
import type { RoutingTarget } from "../models/RoutingTarget";

export function sortIdsDeterministic(
  ids: readonly string[],
): readonly string[] {
  return Object.freeze([...ids].sort((a, b) => a.localeCompare(b)));
}

export function sortCapabilitiesDeterministic(
  items: readonly RoutingCapability[],
): readonly RoutingCapability[] {
  return Object.freeze(
    [...items].sort((a, b) => a.capabilityId.localeCompare(b.capabilityId)),
  );
}

export function sortTargetsDeterministic(
  items: readonly RoutingTarget[],
): readonly RoutingTarget[] {
  return Object.freeze(
    [...items].sort((a, b) => {
      if (a.orderIndex !== b.orderIndex) return a.orderIndex - b.orderIndex;
      return a.id.localeCompare(b.id);
    }),
  );
}

export function sortDependenciesDeterministic(
  items: readonly RoutingDependency[],
): readonly RoutingDependency[] {
  return Object.freeze(
    [...items].sort((a, b) => a.id.localeCompare(b.id)),
  );
}

export function sortStepsDeterministic(
  items: readonly RoutingStep[],
): readonly RoutingStep[] {
  return Object.freeze(
    [...items].sort((a, b) => {
      if (a.orderIndex !== b.orderIndex) return a.orderIndex - b.orderIndex;
      return a.id.localeCompare(b.id);
    }),
  );
}

export function sortDecisionsDeterministic(
  items: readonly RoutingDecision[],
): readonly RoutingDecision[] {
  return Object.freeze(
    [...items].sort((a, b) => a.id.localeCompare(b.id)),
  );
}

export function sortNodesDeterministic(
  items: readonly RoutingNode[],
): readonly RoutingNode[] {
  return Object.freeze([...items].sort((a, b) => a.id.localeCompare(b.id)));
}

export function sortEdgesDeterministic(
  items: readonly RoutingEdge[],
): readonly RoutingEdge[] {
  return Object.freeze([...items].sort((a, b) => a.id.localeCompare(b.id)));
}
