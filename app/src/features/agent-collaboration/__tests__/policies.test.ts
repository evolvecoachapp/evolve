import {
  createAggregationRulesPolicy,
  createDuplicateHandlingPolicy,
  createExecutionOrderingPolicy,
  createParticipantEligibilityPolicy,
  DEFAULT_ROLE_ORDER,
} from "../policies";
import { CollaborationRoles } from "../models/CollaborationRole";
import { CollaborationStatuses } from "../models/CollaborationStatus";
import { EMPTY_COLLABORATION_METADATA } from "../models/CollaborationMetadata";
import { freezeExecutionResult } from "../utils/FreezeCollaborationState";
import { FIXED_TIMESTAMP } from "../testSupport/fixtures";

describe("agent-collaboration policies", () => {
  it("orders participants by default role order", () => {
    expect(DEFAULT_ROLE_ORDER).toEqual([
      CollaborationRoles.WORKOUT,
      CollaborationRoles.NUTRITION,
      CollaborationRoles.RECOVERY,
    ]);

    const policy = createExecutionOrderingPolicy();
    const ordered = policy.orderParticipants([
      Object.freeze({
        id: "p-r",
        agentId: "agent:recovery",
        role: CollaborationRoles.RECOVERY,
        order: 99,
        required: true,
        eligible: true,
        capability: null,
        metadata: EMPTY_COLLABORATION_METADATA,
      }),
      Object.freeze({
        id: "p-w",
        agentId: "agent:workout",
        role: CollaborationRoles.WORKOUT,
        order: 50,
        required: true,
        eligible: true,
        capability: null,
        metadata: EMPTY_COLLABORATION_METADATA,
      }),
    ]);

    expect(ordered.map((p) => p.agentId)).toEqual([
      "agent:workout",
      "agent:recovery",
    ]);
    expect(ordered.map((p) => p.order)).toEqual([1, 2]);
  });

  it("deduplicates by agentId", () => {
    const policy = createDuplicateHandlingPolicy();
    const result = policy.deduplicate([
      Object.freeze({
        id: "p1",
        agentId: "agent:workout",
        role: CollaborationRoles.WORKOUT,
        order: 1,
        required: true,
        eligible: true,
        capability: null,
        metadata: EMPTY_COLLABORATION_METADATA,
      }),
      Object.freeze({
        id: "p2",
        agentId: "agent:workout",
        role: CollaborationRoles.WORKOUT,
        order: 2,
        required: true,
        eligible: true,
        capability: null,
        metadata: EMPTY_COLLABORATION_METADATA,
      }),
    ]);
    expect(result).toHaveLength(1);
  });

  it("filters ineligible and coach participants", () => {
    const policy = createParticipantEligibilityPolicy();
    const filtered = policy.filterEligible([
      Object.freeze({
        id: "coach",
        agentId: "agent:coach",
        role: CollaborationRoles.COACH,
        order: 1,
        required: true,
        eligible: true,
        capability: null,
        metadata: EMPTY_COLLABORATION_METADATA,
      }),
      Object.freeze({
        id: "blocked",
        agentId: "agent:workout",
        role: CollaborationRoles.WORKOUT,
        order: 2,
        required: true,
        eligible: false,
        capability: null,
        metadata: EMPTY_COLLABORATION_METADATA,
      }),
      Object.freeze({
        id: "ok",
        agentId: "agent:nutrition",
        role: CollaborationRoles.NUTRITION,
        order: 3,
        required: true,
        eligible: true,
        capability: null,
        metadata: EMPTY_COLLABORATION_METADATA,
      }),
    ]);
    expect(filtered).toHaveLength(1);
    expect(filtered[0]?.agentId).toBe("agent:nutrition");
  });

  it("aggregates without heuristics", () => {
    const policy = createAggregationRulesPolicy();
    const aggregation = policy.aggregate({
      id: "agg:1",
      collaborationId: "c:1",
      planId: "plan:1",
      contextId: "ctx:1",
      createdAt: FIXED_TIMESTAMP,
      results: [
        freezeExecutionResult({
          id: "r2",
          collaborationId: "c:1",
          planId: "plan:1",
          batchId: "b1",
          taskId: "t2",
          participantId: "p2",
          agentId: "agent:nutrition",
          order: 2,
          success: true,
          status: CollaborationStatuses.COMPLETED,
          message: "ok",
          attributes: Object.freeze({}),
          error: null,
          metadata: EMPTY_COLLABORATION_METADATA,
          startedAt: FIXED_TIMESTAMP,
          completedAt: FIXED_TIMESTAMP,
          durationMs: 1,
          frozenAt: FIXED_TIMESTAMP,
        }),
        freezeExecutionResult({
          id: "r1",
          collaborationId: "c:1",
          planId: "plan:1",
          batchId: "b1",
          taskId: "t1",
          participantId: "p1",
          agentId: "agent:workout",
          order: 1,
          success: true,
          status: CollaborationStatuses.COMPLETED,
          message: "ok",
          attributes: Object.freeze({}),
          error: null,
          metadata: EMPTY_COLLABORATION_METADATA,
          startedAt: FIXED_TIMESTAMP,
          completedAt: FIXED_TIMESTAMP,
          durationMs: 1,
          frozenAt: FIXED_TIMESTAMP,
        }),
      ],
    });

    expect(aggregation.orderedAgentIds).toEqual([
      "agent:workout",
      "agent:nutrition",
    ]);
    expect(aggregation.success).toBe(true);
  });
});
