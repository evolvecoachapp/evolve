import { EMPTY_ROUTING_METADATA } from "../models/RoutingMetadata";
import type { RoutingCapability } from "../models/RoutingCapability";
import type { RoutingConstraint } from "../models/RoutingConstraint";
import type { RoutingDecision } from "../models/RoutingDecision";
import type { RoutingDependency } from "../models/RoutingDependency";
import type { RoutingExecutionOrder } from "../models/RoutingExecutionOrder";
import type { RoutingGraph } from "../models/RoutingGraph";
import type { RoutingMetadata } from "../models/RoutingMetadata";
import type { RoutingPhase } from "../models/RoutingPhase";
import type { RoutingPlan } from "../models/RoutingPlan";
import type { RoutingPolicy } from "../models/RoutingPolicy";
import type { RoutingPriority } from "../models/RoutingPriority";
import type { RoutingReasoning } from "../models/RoutingReasoning";
import type { RoutingStep } from "../models/RoutingStep";
import type { RoutingTarget } from "../models/RoutingTarget";
import { freezePlan } from "../utils/FreezeRoutingState";
import {
  sortCapabilitiesDeterministic,
  sortDecisionsDeterministic,
  sortDependenciesDeterministic,
  sortStepsDeterministic,
  sortTargetsDeterministic,
} from "../utils/sortHelpers";

export interface RoutingPlanBuilderInput {
  readonly id: string;
  readonly requestId: string;
  readonly sessionId: string;
  readonly intent: string;
  readonly capabilities: readonly RoutingCapability[];
  readonly targets: readonly RoutingTarget[];
  readonly dependencies: readonly RoutingDependency[];
  readonly priorities: readonly RoutingPriority[];
  readonly phases: readonly RoutingPhase[];
  readonly steps: readonly RoutingStep[];
  readonly executionOrder: RoutingExecutionOrder;
  readonly graph: RoutingGraph;
  readonly decisions: readonly RoutingDecision[];
  readonly constraints: readonly RoutingConstraint[];
  readonly policies: readonly RoutingPolicy[];
  readonly reasoning: RoutingReasoning;
  readonly metadata?: RoutingMetadata;
  readonly createdAt: string;
  readonly frozenAt?: string;
}

export class RoutingPlanBuilder {
  build(input: RoutingPlanBuilderInput): RoutingPlan {
    return freezePlan({
      id: input.id,
      requestId: input.requestId,
      sessionId: input.sessionId,
      intent: input.intent,
      capabilities: sortCapabilitiesDeterministic(input.capabilities),
      targets: sortTargetsDeterministic(input.targets),
      dependencies: sortDependenciesDeterministic(input.dependencies),
      priorities: Object.freeze([...input.priorities]),
      phases: Object.freeze([...input.phases]),
      steps: sortStepsDeterministic(input.steps),
      executionOrder: input.executionOrder,
      graph: input.graph,
      decisions: sortDecisionsDeterministic(input.decisions),
      constraints: Object.freeze([...input.constraints]),
      policies: Object.freeze([...input.policies]),
      reasoning: input.reasoning,
      metadata: input.metadata ?? EMPTY_ROUTING_METADATA,
      createdAt: input.createdAt,
      frozenAt: input.frozenAt ?? input.createdAt,
    });
  }
}

export function buildRoutingPlanFromInput(
  input: RoutingPlanBuilderInput,
): RoutingPlan {
  return new RoutingPlanBuilder().build(input);
}
