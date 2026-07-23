import { buildRoutingPlanFromInput } from "../builders/RoutingPlanBuilder";
import { EMPTY_ROUTING_METADATA } from "../models/RoutingMetadata";
import {
  RoutingDecisionKinds,
  type RoutingDecision,
} from "../models/RoutingDecision";
import type { RoutingPlan } from "../models/RoutingPlan";
import type { RoutingPolicy } from "../models/RoutingPolicy";
import type { RoutingReasoning } from "../models/RoutingReasoning";
import type { RoutingRequest } from "../models/RoutingRequest";
import type { RoutingTarget } from "../models/RoutingTarget";
import type { RoutingResolution } from "../resolver/RoutingResolver";
import { createCapabilityRoutingPolicy } from "../policies/CapabilityRoutingPolicy";
import { createConsistencyPolicy } from "../policies/ConsistencyPolicy";
import { createDependencyPolicy } from "../policies/DependencyPolicy";
import { createExecutionPolicy } from "../policies/ExecutionPolicy";
import { createPriorityPolicy } from "../policies/PriorityPolicy";
import { createCoreRoutingPolicy } from "../policies/RoutingPolicy";
import { createPhaseSelector } from "../selectors/PhaseSelector";
import { freezeDecision, freezeTarget } from "../utils/FreezeRoutingState";
import { createCapabilityPlanner } from "./CapabilityPlanner";
import { createDependencyPlanner } from "./DependencyPlanner";
import { createExecutionOrderPlanner } from "./ExecutionOrderPlanner";
import { createGraphPlanner } from "./GraphPlanner";
import { createPhasePlanner } from "./PhasePlanner";
import { createPriorityPlanner } from "./PriorityPlanner";

export interface RoutingPlannerDeps {
  readonly capabilityPlanner?: ReturnType<typeof createCapabilityPlanner>;
  readonly dependencyPlanner?: ReturnType<typeof createDependencyPlanner>;
  readonly priorityPlanner?: ReturnType<typeof createPriorityPlanner>;
  readonly phasePlanner?: ReturnType<typeof createPhasePlanner>;
  readonly executionOrderPlanner?: ReturnType<
    typeof createExecutionOrderPlanner
  >;
  readonly graphPlanner?: ReturnType<typeof createGraphPlanner>;
}

/**
 * Deterministic routing planner — builds immutable RoutingPlan only.
 * Never executes agents, collaboration, or AI providers.
 */
export class RoutingPlanner {
  private readonly capabilityPlanner: ReturnType<typeof createCapabilityPlanner>;
  private readonly dependencyPlanner: ReturnType<typeof createDependencyPlanner>;
  private readonly priorityPlanner: ReturnType<typeof createPriorityPlanner>;
  private readonly phasePlanner: ReturnType<typeof createPhasePlanner>;
  private readonly executionOrderPlanner: ReturnType<
    typeof createExecutionOrderPlanner
  >;
  private readonly graphPlanner: ReturnType<typeof createGraphPlanner>;
  private readonly phaseSelector = createPhaseSelector();
  private readonly policies: readonly RoutingPolicy[];

  constructor(deps: RoutingPlannerDeps = {}) {
    this.capabilityPlanner =
      deps.capabilityPlanner ?? createCapabilityPlanner();
    this.dependencyPlanner =
      deps.dependencyPlanner ?? createDependencyPlanner();
    this.priorityPlanner = deps.priorityPlanner ?? createPriorityPlanner();
    this.phasePlanner = deps.phasePlanner ?? createPhasePlanner();
    this.executionOrderPlanner =
      deps.executionOrderPlanner ?? createExecutionOrderPlanner();
    this.graphPlanner = deps.graphPlanner ?? createGraphPlanner();

    this.policies = Object.freeze([
      createCoreRoutingPolicy().policy,
      createDependencyPolicy().policy,
      createPriorityPolicy().policy,
      createCapabilityRoutingPolicy().policy,
      createExecutionPolicy().policy,
      createConsistencyPolicy().policy,
    ]);
  }

  plan(input: {
    readonly request: RoutingRequest;
    readonly resolution: RoutingResolution;
    readonly sessionId: string;
    readonly planId?: string;
    readonly clock: () => string;
  }): RoutingPlan {
    const now = input.clock();
    const planId = input.planId ?? `plan:${input.sessionId}`;
    const capabilities = this.capabilityPlanner.plan(input.resolution.resolved);
    const dependencies = this.dependencyPlanner.plan({
      capabilities,
      dependencies: input.resolution.dependencies,
    });
    const priorities = this.priorityPlanner.plan(capabilities);

    const targets = this.buildTargets({
      capabilities,
      resolution: input.resolution,
      now,
    });

    const orderPlan = this.executionOrderPlanner.plan({
      planId,
      capabilities,
      targets,
      dependencies,
      priorities,
    });

    // Re-assign target orderIndex from planned order
    const orderByCapability = new Map(
      orderPlan.orderedCapabilityIds.map((id, index) => [id, index]),
    );
    const orderedTargets = Object.freeze(
      targets.map((target) =>
        freezeTarget({
          ...target,
          orderIndex: orderByCapability.get(target.capabilityId) ?? target.orderIndex,
        }),
      ),
    );

    const phases = this.phasePlanner.plan(orderedTargets);
    const graph = this.graphPlanner.plan({
      planId,
      targets: orderedTargets,
      steps: orderPlan.steps,
      dependencies,
    });

    const decisions: readonly RoutingDecision[] = Object.freeze([
      ...input.resolution.decisions,
      ...orderPlan.steps.map((step) =>
        freezeDecision({
          id: `decision:order:${step.id}`,
          kind: RoutingDecisionKinds.ORDER_ASSIGNED,
          subjectId: step.id,
          agentId: step.agentId,
          capabilityId: step.capabilityId,
          reason: `Assigned execution order index ${step.orderIndex}.`,
          metadata: EMPTY_ROUTING_METADATA,
          decidedAt: now,
        }),
      ),
    ]);

    const reasoning: RoutingReasoning = Object.freeze({
      id: `reasoning:${planId}`,
      summary:
        "Deterministic capability resolution and dependency-ordered routing plan.",
      decisions,
      rulesApplied: Object.freeze(this.policies.map((p) => p.name)),
      metadata: EMPTY_ROUTING_METADATA,
    });

    return buildRoutingPlanFromInput({
      id: planId,
      requestId: input.request.id,
      sessionId: input.sessionId,
      intent: input.request.intent,
      capabilities,
      targets: orderedTargets,
      dependencies,
      priorities,
      phases,
      steps: orderPlan.steps,
      executionOrder: orderPlan.executionOrder,
      graph,
      decisions,
      constraints: input.request.constraints,
      policies: this.policies,
      reasoning,
      metadata: input.request.metadata,
      createdAt: now,
    });
  }

  private buildTargets(input: {
    readonly capabilities: readonly import("../models/RoutingCapability").RoutingCapability[];
    readonly resolution: RoutingResolution;
    readonly now: string;
  }): readonly RoutingTarget[] {
    const ownerByCapability = new Map(
      input.resolution.owners.map((owner) => [owner.capabilityId, owner]),
    );
    const defaultPhase = this.phaseSelector.defaultPhase();

    return Object.freeze(
      input.capabilities.map((capability, index) => {
        const owner = ownerByCapability.get(capability.capabilityId)!;
        return freezeTarget({
          id: `target:${capability.capabilityId}`,
          agentId: owner.agentId,
          capabilityId: capability.capabilityId,
          priority: capability.priority,
          phase: defaultPhase,
          orderIndex: index,
          required: capability.required,
          metadata: capability.metadata,
        });
      }),
    );
  }
}

export function createRoutingPlanner(
  deps: RoutingPlannerDeps = {},
): RoutingPlanner {
  return new RoutingPlanner(deps);
}
