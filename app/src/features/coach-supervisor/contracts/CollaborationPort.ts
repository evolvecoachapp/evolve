import {
  AgentExecutionStatuses,
  type AgentExecutionSummary,
} from "../models/AgentExecutionSummary";
import { EMPTY_SUPERVISOR_METADATA } from "../models/CoachSupervisorMetadata";
import type { CoordinationPlan } from "../models/CoordinationPlan";
import { CoordinationStepKinds } from "../models/CoordinationStep";
import { freezeAgentSummary } from "../utils/FreezeSupervisorState";

export interface CollaborationExecutionInput {
  readonly plan: CoordinationPlan;
  readonly clock: () => string;
}

export interface CollaborationExecutionOutput {
  readonly success: boolean;
  readonly collaborationRequestId: string | null;
  readonly summaries: readonly AgentExecutionSummary[];
  readonly message: string | null;
}

export interface CollaborationPort {
  execute(input: CollaborationExecutionInput): CollaborationExecutionOutput;
}

/**
 * Deterministic mock collaboration — one succeeded summary per invoke step.
 */
export class MockCollaborationPort implements CollaborationPort {
  execute(input: CollaborationExecutionInput): CollaborationExecutionOutput {
    const now = input.clock();
    const invokeSteps = input.plan.steps.filter(
      (s) => s.kind === CoordinationStepKinds.INVOKE_AGENT && s.agentId,
    );
    const summaries = invokeSteps.map((step, index) =>
      freezeAgentSummary({
        id: `asum:${input.plan.id}:${index}`,
        agentId: step.agentId!,
        capabilityId: step.capabilityId,
        role: null,
        status: AgentExecutionStatuses.SUCCEEDED,
        success: true,
        message: `Mock execution for ${step.agentId}`,
        orderIndex: step.orderIndex,
        provenance: `mock:${step.agentId}`,
        metadata: EMPTY_SUPERVISOR_METADATA,
        startedAt: now,
        completedAt: now,
      }),
    );
    return Object.freeze({
      success: true,
      collaborationRequestId: `collab:${input.plan.requestId}`,
      summaries: Object.freeze(summaries),
      message: "Collaboration executed (mock).",
    });
  }
}

export function createMockCollaborationPort(): MockCollaborationPort {
  return new MockCollaborationPort();
}
