import type { IAgent } from "../../agent-framework/contracts/IAgent";
import { createStubAgent } from "../../agent-framework/testSupport/fixtures";
import type { AgentCapabilityKey } from "../../agent-framework/models/AgentCapabilityKey";
import { AgentCapabilityKeys } from "../../agent-framework/models/AgentCapabilityKey";
import { AgentPriorities } from "../../agent-framework/models/AgentPriority";
import type { AgentRole } from "../../agent-framework/models/AgentRole";
import { AgentRoles } from "../../agent-framework/models/AgentRole";
import { createRecoveryFrameworkAgent } from "../../recovery-agent/framework/RecoveryFrameworkAgent";
import { createRecoveryAgentService } from "../../recovery-agent/services/RecoveryAgentService";
import { buildAgentRuntimeRequest } from "../builders/AgentRuntimeRequestBuilder";
import type { AgentRuntimeExecutor } from "../models/AgentRuntimeExecutor";
import { AgentRuntimeStatuses } from "../models/AgentRuntimeStatus";
import { createAgentRuntimeService } from "../services/AgentRuntimeService";
import { freezeResult } from "../utils/FreezeRuntime";

export const FIXED_TIMESTAMP = "2026-07-23T12:00:00.000Z";
export const FIXED_NOW_MS = 1_721_736_000_000;

export function createFixedClock(ts = FIXED_TIMESTAMP): () => string {
  return () => ts;
}

export function createFixedNowMs(ms = FIXED_NOW_MS): () => number {
  return () => ms;
}

export function createTestRuntimeService() {
  return createAgentRuntimeService({
    clock: createFixedClock(),
    nowMs: createFixedNowMs(),
    runtimeId: "runtime:agent:test",
  });
}

export function createWorkoutAgent(): IAgent {
  return createStubAgent({
    id: "agent:workout:runtime",
    name: "Workout Agent",
    role: AgentRoles.WORKOUT,
    priority: AgentPriorities.HIGH,
    capabilityKeys: [
      AgentCapabilityKeys.WORKOUT_PLANNING,
      AgentCapabilityKeys.REASONING,
      AgentCapabilityKeys.EXPLANATION,
    ],
  });
}

export function createNutritionAgent(): IAgent {
  return createStubAgent({
    id: "agent:nutrition:runtime",
    name: "Nutrition Agent",
    role: AgentRoles.NUTRITION,
    priority: AgentPriorities.NORMAL,
    capabilityKeys: [
      AgentCapabilityKeys.NUTRITION_PLANNING,
      AgentCapabilityKeys.REASONING,
    ],
  });
}

export function createGenericAgent(id = "agent:generic:runtime"): IAgent {
  return createStubAgent({
    id,
    name: "Generic Agent",
    role: AgentRoles.GENERIC,
    priority: AgentPriorities.LOW,
    capabilityKeys: [AgentCapabilityKeys.REASONING],
  });
}

export function createRecoveryFrameworkAgentFixture(): IAgent {
  const recovery = createRecoveryAgentService({
    clock: createFixedClock(),
    agentId: "agent:recovery:runtime",
  }).describeCapabilities();
  return createRecoveryFrameworkAgent({
    recoveryAgent: recovery,
    clock: createFixedClock(),
  });
}

export function createRoleRequest(role: AgentRole = AgentRoles.WORKOUT) {
  return buildAgentRuntimeRequest({
    id: "areq:test:1",
    role,
    intent: "test-intent",
    createdAt: FIXED_TIMESTAMP,
  });
}

export function createCapabilityRequest(
  capability: AgentCapabilityKey = AgentCapabilityKeys.RECOVERY_ANALYSIS,
) {
  return buildAgentRuntimeRequest({
    id: "areq:test:cap",
    capability,
    intent: "capability-intent",
    createdAt: FIXED_TIMESTAMP,
  });
}

export function createAgentIdRequest(agentId: string) {
  return buildAgentRuntimeRequest({
    id: "areq:test:id",
    agentId,
    intent: "id-intent",
    createdAt: FIXED_TIMESTAMP,
  });
}

export function createFallbackRequest() {
  return buildAgentRuntimeRequest({
    id: "areq:test:fallback",
    role: AgentRoles.GOAL,
    fallbackRole: AgentRoles.GENERIC,
    intent: "fallback-intent",
    createdAt: FIXED_TIMESTAMP,
  });
}

export function createTrackingExecutor(
  label = "custom",
): AgentRuntimeExecutor {
  return (input) =>
    freezeResult({
      id: `result:${input.plan.id}`,
      planId: input.plan.id,
      requestId: input.request.id,
      agentId: input.agent.id,
      success: true,
      status: AgentRuntimeStatuses.COMPLETED,
      message: `Custom executor:${label}`,
      attributes: Object.freeze({ executor: label }),
      error: null,
      metadata: {
        tags: Object.freeze(["custom-executor"]),
        attributes: Object.freeze({}),
      },
      startedAt: input.startedAt,
      completedAt: input.clock(),
      durationMs: 1,
      frozenAt: input.clock(),
    });
}
