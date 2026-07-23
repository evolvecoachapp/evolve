import {
  CoachSupervisorDecisionKinds,
  type CoachSupervisorDecision,
} from "../models/CoachSupervisorDecision";
import { EMPTY_SUPERVISOR_METADATA } from "../models/CoachSupervisorMetadata";
import type { CoachSupervisorPlan } from "../models/CoachSupervisorPlan";
import type { CoordinationPlan } from "../models/CoordinationPlan";
import { SupervisorConfidenceLevels } from "../models/SupervisorConfidence";
import {
  freezeDecision,
  freezePlan,
} from "../utils/FreezeSupervisorState";

export function buildSupervisorDecision(input: {
  readonly id: string;
  readonly coordination: CoordinationPlan;
  readonly createdAt: string;
  readonly fail?: boolean;
}): CoachSupervisorDecision {
  return freezeDecision({
    id: input.id,
    kind: input.fail
      ? CoachSupervisorDecisionKinds.FAIL
      : CoachSupervisorDecisionKinds.COORDINATE,
    selectedAgentIds: Object.freeze([...input.coordination.orderedAgentIds]),
    selectedCapabilityIds: Object.freeze([
      ...input.coordination.orderedCapabilityIds,
    ]),
    confidence: Object.freeze({
      level: input.fail
        ? SupervisorConfidenceLevels.LOW
        : SupervisorConfidenceLevels.HIGH,
      score: input.fail ? 0 : 1,
      rationale: input.fail ? "Planning failed." : "Plan ready.",
    }),
    reasoning: input.coordination.reasoning,
    metadata: EMPTY_SUPERVISOR_METADATA,
    createdAt: input.createdAt,
  });
}

export function buildSupervisorPlan(input: {
  readonly id: string;
  readonly coordination: CoordinationPlan;
  readonly createdAt: string;
  readonly fail?: boolean;
}): CoachSupervisorPlan {
  const decision = buildSupervisorDecision({
    id: `${input.id}:decision`,
    coordination: input.coordination,
    createdAt: input.createdAt,
    fail: input.fail,
  });
  return freezePlan({
    id: input.id,
    requestId: input.coordination.requestId,
    coordination: input.coordination,
    decision,
    reasoning: decision.reasoning,
    metadata: EMPTY_SUPERVISOR_METADATA,
    createdAt: input.createdAt,
    frozenAt: input.createdAt,
  });
}
