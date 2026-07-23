import type { RoutingResolutionTarget } from "../contracts/RoutingPort";
import { EMPTY_SUPERVISOR_METADATA } from "../models/CoachSupervisorMetadata";
import type { CoachSupervisorRequest } from "../models/CoachSupervisorRequest";
import {
  CoordinationPhaseKinds,
  type CoordinationPhase,
} from "../models/CoordinationPhase";
import type { CoordinationPlan } from "../models/CoordinationPlan";
import {
  CoordinationStepKinds,
  type CoordinationStep,
} from "../models/CoordinationStep";
import { EMPTY_SUPERVISOR_REASONING } from "../models/SupervisorReasoning";
import {
  freezeCoordinationPlan,
  freezeRequest,
} from "../utils/FreezeSupervisorState";

export function buildCoordinationPlan(input: {
  readonly id: string;
  readonly request: CoachSupervisorRequest;
  readonly targets: readonly RoutingResolutionTarget[];
  readonly routingPlanId?: string | null;
  readonly createdAt: string;
}): CoordinationPlan {
  const request = freezeRequest(input.request);
  const steps: CoordinationStep[] = [];
  const phases: CoordinationPhase[] = [];

  const routeStep: CoordinationStep = Object.freeze({
    id: `${input.id}:step:route`,
    kind: CoordinationStepKinds.ROUTE,
    agentId: null,
    capabilityId: null,
    orderIndex: 0,
    dependsOnStepIds: Object.freeze([] as string[]),
    phaseId: `${input.id}:phase:route`,
    description: "Resolve routing",
    metadata: EMPTY_SUPERVISOR_METADATA,
  });
  steps.push(routeStep);

  let order = 1;
  const invokeIds: string[] = [];
  for (const target of input.targets) {
    const stepId = `${input.id}:step:invoke:${target.agentId}:${target.capabilityId}`;
    steps.push(
      Object.freeze({
        id: stepId,
        kind: CoordinationStepKinds.INVOKE_AGENT,
        agentId: target.agentId,
        capabilityId: target.capabilityId,
        orderIndex: order,
        dependsOnStepIds: Object.freeze([routeStep.id]),
        phaseId: `${input.id}:phase:dispatch`,
        description: `Invoke ${target.agentId}`,
        metadata: EMPTY_SUPERVISOR_METADATA,
      }),
    );
    invokeIds.push(stepId);
    order += 1;
  }

  const aggregateStep: CoordinationStep = Object.freeze({
    id: `${input.id}:step:aggregate`,
    kind: CoordinationStepKinds.AGGREGATE,
    agentId: null,
    capabilityId: null,
    orderIndex: order,
    dependsOnStepIds: Object.freeze([...invokeIds]),
    phaseId: `${input.id}:phase:aggregate`,
    description: "Aggregate specialist results",
    metadata: EMPTY_SUPERVISOR_METADATA,
  });
  steps.push(aggregateStep);

  const respondStep: CoordinationStep = Object.freeze({
    id: `${input.id}:step:respond`,
    kind: CoordinationStepKinds.RESPOND,
    agentId: null,
    capabilityId: null,
    orderIndex: order + 1,
    dependsOnStepIds: Object.freeze([aggregateStep.id]),
    phaseId: `${input.id}:phase:respond`,
    description: "Build unified coach response",
    metadata: EMPTY_SUPERVISOR_METADATA,
  });
  steps.push(respondStep);

  phases.push(
    Object.freeze({
      id: `${input.id}:phase:route`,
      kind: CoordinationPhaseKinds.ROUTE,
      orderIndex: 0,
      stepIds: Object.freeze([routeStep.id]),
      description: "Routing",
    }),
    Object.freeze({
      id: `${input.id}:phase:dispatch`,
      kind: CoordinationPhaseKinds.DISPATCH,
      orderIndex: 1,
      stepIds: Object.freeze([...invokeIds]),
      description: "Dispatch specialists",
    }),
    Object.freeze({
      id: `${input.id}:phase:aggregate`,
      kind: CoordinationPhaseKinds.AGGREGATE,
      orderIndex: 2,
      stepIds: Object.freeze([aggregateStep.id]),
      description: "Aggregation",
    }),
    Object.freeze({
      id: `${input.id}:phase:respond`,
      kind: CoordinationPhaseKinds.RESPOND,
      orderIndex: 3,
      stepIds: Object.freeze([respondStep.id]),
      description: "Response",
    }),
  );

  const orderedAgentIds = Object.freeze(
    input.targets.map((t) => t.agentId),
  );
  const orderedCapabilityIds = Object.freeze(
    input.targets.map((t) => t.capabilityId),
  );

  return freezeCoordinationPlan({
    id: input.id,
    requestId: request.id,
    context: Object.freeze({
      id: `${input.id}:ctx`,
      requestId: request.id,
      request,
      routingPlanId: input.routingPlanId ?? null,
      agentIds: orderedAgentIds,
      capabilityIds: orderedCapabilityIds,
      metadata: EMPTY_SUPERVISOR_METADATA,
      createdAt: input.createdAt,
      frozenAt: input.createdAt,
    }),
    steps: Object.freeze(steps),
    phases: Object.freeze(phases),
    orderedAgentIds,
    orderedCapabilityIds,
    routingPlanId: input.routingPlanId ?? null,
    reasoning: Object.freeze({
      ...EMPTY_SUPERVISOR_REASONING,
      summary: "Deterministic coordination from routing targets.",
      steps: Object.freeze([
        "route",
        "invoke specialists",
        "aggregate",
        "respond",
      ]),
    }),
    metadata: EMPTY_SUPERVISOR_METADATA,
    createdAt: input.createdAt,
    frozenAt: input.createdAt,
  });
}
