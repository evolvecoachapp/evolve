import { buildCollaborationPlan } from "../builders/CollaborationPlanBuilder";
import { buildCollaborationRequest } from "../builders/CollaborationRequestBuilder";
import { CollaborationRoles } from "../models/CollaborationRole";
import { CollaborationStatuses } from "../models/CollaborationStatus";
import { EMPTY_COLLABORATION_METADATA } from "../models/CollaborationMetadata";
import {
  validateAggregationInputs,
  validateCollaborationPlan,
  validateCollaborationRequest,
  validateParticipants,
} from "../validators";
import { FIXED_TIMESTAMP } from "../testSupport/fixtures";

describe("agent-collaboration validators", () => {
  it("rejects empty collaboration request", () => {
    const validation = validateCollaborationRequest(null);
    expect(validation.valid).toBe(false);
    expect(validation.issues[0]?.code).toBe("request_invalid");
  });

  it("rejects request without roles or agent ids", () => {
    const request = buildCollaborationRequest({
      id: "req:1",
      coachAgentId: "agent:coach",
      intent: "x",
      requestedRoles: [],
      requestedAgentIds: [],
      createdAt: FIXED_TIMESTAMP,
    });
    const validation = validateCollaborationRequest(request);
    expect(validation.valid).toBe(false);
    expect(validation.issues.some((i) => i.code === "empty_plan")).toBe(true);
  });

  it("validates participants for duplicates and order", () => {
    const participants = [
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
        order: 1,
        required: true,
        eligible: true,
        capability: null,
        metadata: EMPTY_COLLABORATION_METADATA,
      }),
    ];

    const validation = validateParticipants(participants);
    expect(validation.valid).toBe(false);
    expect(
      validation.issues.some((i) => i.code === "duplicate_participant"),
    ).toBe(true);
    expect(validation.issues.some((i) => i.code === "invalid_order")).toBe(
      true,
    );
  });

  it("validates plan task/participant integrity", () => {
    const plan = buildCollaborationPlan({
      id: "plan:1",
      requestId: "req:1",
      collaborationId: "c:1",
      participants: [
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
      ],
      tasks: [
        Object.freeze({
          id: "task:1",
          participantId: "missing",
          agentId: "agent:workout",
          order: 1,
          batchId: "batch:1",
          intent: "x",
          status: CollaborationStatuses.PLANNING,
          attributes: Object.freeze({}),
          metadata: EMPTY_COLLABORATION_METADATA,
        }),
      ],
      batches: [
        Object.freeze({
          id: "batch:1",
          planId: "plan:1",
          order: 1,
          taskIds: Object.freeze(["task:1"]),
          status: CollaborationStatuses.PLANNING,
          metadata: EMPTY_COLLABORATION_METADATA,
        }),
      ],
      createdAt: FIXED_TIMESTAMP,
    });

    const validation = validateCollaborationPlan(plan);
    expect(validation.valid).toBe(false);
    expect(validation.issues.some((i) => i.code === "plan_integrity")).toBe(
      true,
    );
  });

  it("validates aggregation inputs require results", () => {
    const validation = validateAggregationInputs({ results: [] });
    expect(validation.valid).toBe(false);
    expect(validation.issues[0]?.code).toBe("aggregation_invalid");
  });
});
