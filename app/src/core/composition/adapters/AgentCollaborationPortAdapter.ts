import type { AgentCollaborationService } from "../../../features/agent-collaboration/services/AgentCollaborationService";
import { CollaborationRoles } from "../../../features/agent-collaboration/models/CollaborationRole";
import { EMPTY_COLLABORATION_METADATA } from "../../../features/agent-collaboration/models/CollaborationMetadata";
import type { CollaborationRequest } from "../../../features/agent-collaboration/models/CollaborationRequest";
import {
  AgentExecutionStatuses,
  type AgentExecutionSummary,
} from "../../../features/coach-supervisor/models/AgentExecutionSummary";
import type {
  CollaborationExecutionInput,
  CollaborationExecutionOutput,
  CollaborationPort,
} from "../../../features/coach-supervisor/contracts/CollaborationPort";
import { CoordinationStepKinds } from "../../../features/coach-supervisor/models/CoordinationStep";
import { EMPTY_SUPERVISOR_METADATA } from "../../../features/coach-supervisor/models/CoachSupervisorMetadata";
import { freezeAgentSummary } from "../../../features/coach-supervisor/utils/FreezeSupervisorState";

/**
 * Thin adapter: Agent Collaboration Service → Coach Supervisor CollaborationPort.
 * Sync orchestration bridge — no domain logic.
 */
export function createAgentCollaborationPortAdapter(
  collaboration: AgentCollaborationService,
): CollaborationPort {
  return Object.freeze({
    execute(input: CollaborationExecutionInput): CollaborationExecutionOutput {
      const now = input.clock();
      const collabRequest = toCollaborationRequest(input, now);
      const planned = collaboration.createCollaborationPlan(collabRequest);

      const invokeSteps = input.plan.steps.filter(
        (step) =>
          step.kind === CoordinationStepKinds.INVOKE_AGENT && step.agentId,
      );

      const summaries: AgentExecutionSummary[] = invokeSteps.map(
        (step, index) =>
          freezeAgentSummary({
            id: `asum:${input.plan.id}:${index}`,
            agentId: step.agentId!,
            capabilityId: step.capabilityId,
            role: null,
            status: planned.success
              ? AgentExecutionStatuses.SUCCEEDED
              : AgentExecutionStatuses.FAILED,
            success: planned.success,
            message: planned.success
              ? `Collaboration step for ${step.agentId}`
              : (planned.message ?? "Collaboration plan failed."),
            orderIndex: step.orderIndex,
            provenance: `collaboration:${planned.plan?.id ?? input.plan.id}`,
            metadata: EMPTY_SUPERVISOR_METADATA,
            startedAt: now,
            completedAt: now,
          }),
      );

      return Object.freeze({
        success: planned.success,
        collaborationRequestId: collabRequest.id,
        summaries: Object.freeze(summaries),
        message: planned.message,
      });
    },
  });
}

function toCollaborationRequest(
  input: CollaborationExecutionInput,
  createdAt: string,
): CollaborationRequest {
  const agentIds = Object.freeze([
    ...new Set(
      input.plan.orderedAgentIds.length > 0
        ? [...input.plan.orderedAgentIds]
        : input.plan.steps
            .map((step) => step.agentId)
            .filter((id): id is string => Boolean(id)),
    ),
  ]);

  return Object.freeze({
    id: `collab-req:${input.plan.requestId}`,
    coachAgentId: "agent:coach-supervisor",
    intent: "supervisor_coordination",
    requestedRoles: Object.freeze([
      CollaborationRoles.WORKOUT,
      CollaborationRoles.NUTRITION,
      CollaborationRoles.RECOVERY,
    ]),
    requestedAgentIds: agentIds,
    athleteId: input.plan.context.request.athleteId,
    conversationId: input.plan.context.request.conversationId,
    sessionId: input.plan.context.request.sessionId,
    attributes: Object.freeze({
      coordinationPlanId: input.plan.id,
      routingPlanId: input.plan.routingPlanId,
    }),
    metadata: EMPTY_COLLABORATION_METADATA,
    createdAt,
  });
}
