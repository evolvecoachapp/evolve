import { EMPTY_ROUTING_METADATA } from "../models/RoutingMetadata";
import type { RoutingCapability } from "../models/RoutingCapability";
import type { RoutingDependency } from "../models/RoutingDependency";
import type { RoutingExecutionOrder } from "../models/RoutingExecutionOrder";
import type { RoutingPriority } from "../models/RoutingPriority";
import type { RoutingStep } from "../models/RoutingStep";
import type { RoutingTarget } from "../models/RoutingTarget";
import { RoutingPhaseKinds } from "../models/RoutingPhase";
import { createPriorityPolicy } from "../policies/PriorityPolicy";
import { topologicalSort } from "../utils/DependencyHelpers";
import { freezeExecutionOrder, freezeStep } from "../utils/FreezeRoutingState";

/**
 * Plans deterministic execution order via topological sort + declared priority.
 * Planning only — never executes agents.
 */
export class ExecutionOrderPlanner {
  private readonly priorityPolicy = createPriorityPolicy();

  plan(input: {
    readonly planId: string;
    readonly capabilities: readonly RoutingCapability[];
    readonly targets: readonly RoutingTarget[];
    readonly dependencies: readonly RoutingDependency[];
    readonly priorities: readonly RoutingPriority[];
  }): {
    readonly steps: readonly RoutingStep[];
    readonly executionOrder: RoutingExecutionOrder;
    readonly orderedCapabilityIds: readonly string[];
  } {
    const capabilityIds = input.capabilities.map((c) => c.capabilityId);
    const topo = topologicalSort(capabilityIds, input.dependencies);

    const priorityByCapability = new Map(
      input.priorities.map((p) => [p.subjectId, p]),
    );

    let orderedCapabilityIds: string[];
    if (topo) {
      orderedCapabilityIds = [...topo];
    } else {
      // Cycle — fall back to priority + id (validator will flag cycle)
      orderedCapabilityIds = [...capabilityIds].sort((a, b) => {
        const pa = priorityByCapability.get(a);
        const pb = priorityByCapability.get(b);
        return this.priorityPolicy.compare(
          {
            priority: pa?.level ?? "normal",
            id: a,
          },
          {
            priority: pb?.level ?? "normal",
            id: b,
          },
        );
      });
    }

    // Stable secondary sort by priority within equal topo relative groups is
    // already covered when no edges exist: topo returns sorted zero-indegree.
    // When edges exist, topo order wins; priority used only for tie fallback.

    const targetByCapability = new Map(
      input.targets.map((t) => [t.capabilityId, t]),
    );

    const steps: RoutingStep[] = [];
    orderedCapabilityIds.forEach((capabilityId, orderIndex) => {
      const target = targetByCapability.get(capabilityId);
      if (!target) return;
      const dependsOn = input.dependencies
        .filter((dep) => dep.fromId === capabilityId)
        .map((dep) => `step:${dep.toId}`)
        .sort((a, b) => a.localeCompare(b));

      steps.push(
        freezeStep({
          id: `step:${capabilityId}`,
          targetId: target.id,
          agentId: target.agentId,
          capabilityId,
          phase: target.phase || RoutingPhaseKinds.COLLABORATE,
          priority: target.priority,
          orderIndex,
          dependsOnStepIds: Object.freeze(dependsOn),
          metadata: EMPTY_ROUTING_METADATA,
        }),
      );
    });

    // Re-index contiguous after filtering missing targets
    const reindexed = steps.map((step, orderIndex) =>
      freezeStep({ ...step, orderIndex }),
    );

    const executionOrder = freezeExecutionOrder({
      id: `order:${input.planId}`,
      planId: input.planId,
      stepIds: Object.freeze(reindexed.map((step) => step.id)),
      steps: Object.freeze(reindexed),
      batchCount: reindexed.length,
    });

    return Object.freeze({
      steps: Object.freeze(reindexed),
      executionOrder,
      orderedCapabilityIds: Object.freeze(orderedCapabilityIds),
    });
  }
}

export function createExecutionOrderPlanner(): ExecutionOrderPlanner {
  return new ExecutionOrderPlanner();
}
