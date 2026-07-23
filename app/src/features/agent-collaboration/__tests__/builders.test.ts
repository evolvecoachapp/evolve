import {
  buildAggregationContext,
  buildCollaborationPlan,
  buildCollaborationRequest,
  buildCollaborationSnapshotFromInput,
} from "../builders";
import { CollaborationRoles } from "../models/CollaborationRole";
import { CollaborationStatuses } from "../models/CollaborationStatus";
import { EMPTY_COLLABORATION_METADATA } from "../models/CollaborationMetadata";
import { FIXED_TIMESTAMP } from "../testSupport/fixtures";

describe("agent-collaboration builders", () => {
  it("builds frozen collaboration request", () => {
    const request = buildCollaborationRequest({
      id: "req:1",
      coachAgentId: "agent:coach",
      intent: "plan day",
      requestedRoles: [CollaborationRoles.WORKOUT],
      createdAt: FIXED_TIMESTAMP,
    });

    expect(Object.isFrozen(request)).toBe(true);
    expect(request.requestedRoles).toEqual([CollaborationRoles.WORKOUT]);
  });

  it("builds frozen plan / aggregation context / snapshot", () => {
    const participant = Object.freeze({
      id: "participant:1",
      agentId: "agent:workout",
      role: CollaborationRoles.WORKOUT,
      order: 1,
      required: true,
      eligible: true,
      capability: null,
      metadata: EMPTY_COLLABORATION_METADATA,
    });

    const task = Object.freeze({
      id: "task:1",
      participantId: "participant:1",
      agentId: "agent:workout",
      order: 1,
      batchId: "batch:1",
      intent: "plan day",
      status: CollaborationStatuses.PLANNING,
      attributes: Object.freeze({}),
      metadata: EMPTY_COLLABORATION_METADATA,
    });

    const batch = Object.freeze({
      id: "batch:1",
      planId: "plan:1",
      order: 1,
      taskIds: Object.freeze(["task:1"]),
      status: CollaborationStatuses.PLANNING,
      metadata: EMPTY_COLLABORATION_METADATA,
    });

    const plan = buildCollaborationPlan({
      id: "plan:1",
      requestId: "req:1",
      collaborationId: "collaboration:1",
      participants: [participant],
      tasks: [task],
      batches: [batch],
      createdAt: FIXED_TIMESTAMP,
    });

    expect(Object.isFrozen(plan)).toBe(true);
    expect(plan.frozenAt).toBe(FIXED_TIMESTAMP);

    const context = buildAggregationContext({
      id: "ctx:1",
      collaborationId: "collaboration:1",
      plan,
      results: [],
      createdAt: FIXED_TIMESTAMP,
    });
    expect(Object.isFrozen(context)).toBe(true);

    const request = buildCollaborationRequest({
      id: "req:1",
      coachAgentId: "agent:coach",
      intent: "plan day",
      requestedRoles: [CollaborationRoles.WORKOUT],
      createdAt: FIXED_TIMESTAMP,
    });

    const snapshot = buildCollaborationSnapshotFromInput({
      id: "snap:1",
      collaborationId: "collaboration:1",
      request,
      plan,
      results: [],
      createdAt: FIXED_TIMESTAMP,
    });
    expect(Object.isFrozen(snapshot)).toBe(true);
    expect(snapshot.participantCount).toBe(1);
  });
});
