import { createCollaborationPlanner } from "../planning/CollaborationPlanner";
import { createParticipantSelector } from "../planning/ParticipantSelector";
import { CollaborationRoles } from "../models/CollaborationRole";
import {
  createCoachRequest,
  createFixedClock,
  FIXED_TIMESTAMP,
} from "../testSupport/fixtures";

describe("agent-collaboration planning", () => {
  it("selects specialists and orders workout → nutrition → recovery", () => {
    const selector = createParticipantSelector();
    const participants = selector.select(
      createCoachRequest({
        requestedRoles: [
          CollaborationRoles.RECOVERY,
          CollaborationRoles.WORKOUT,
          CollaborationRoles.NUTRITION,
        ],
      }),
    );

    expect(participants.map((p) => p.role)).toEqual([
      CollaborationRoles.WORKOUT,
      CollaborationRoles.NUTRITION,
      CollaborationRoles.RECOVERY,
    ]);
    expect(participants.map((p) => p.order)).toEqual([1, 2, 3]);
  });

  it("excludes coach role from specialist participants", () => {
    const selector = createParticipantSelector();
    const participants = selector.select(
      createCoachRequest({
        requestedRoles: [
          CollaborationRoles.COACH,
          CollaborationRoles.WORKOUT,
        ],
      }),
    );

    expect(participants).toHaveLength(1);
    expect(participants[0]?.role).toBe(CollaborationRoles.WORKOUT);
  });

  it("builds immutable plan with tasks and batch without executing", () => {
    const planner = createCollaborationPlanner();
    const plan = planner.plan({
      request: createCoachRequest(),
      collaborationId: "collaboration:plan-test",
      clock: createFixedClock(),
    });

    expect(Object.isFrozen(plan)).toBe(true);
    expect(plan.requestId).toBe("req:collab:1");
    expect(plan.participants).toHaveLength(3);
    expect(plan.tasks).toHaveLength(3);
    expect(plan.batches).toHaveLength(1);
    expect(plan.batches[0]?.taskIds).toHaveLength(3);
    expect(plan.createdAt).toBe(FIXED_TIMESTAMP);
    expect(plan.policies.length).toBeGreaterThanOrEqual(3);
  });

  it("deduplicates participants by agentId", () => {
    const selector = createParticipantSelector();
    const participants = selector.select(
      createCoachRequest({
        requestedRoles: [CollaborationRoles.WORKOUT],
        requestedAgentIds: ["agent:workout"],
      }),
    );

    expect(participants).toHaveLength(1);
    expect(participants[0]?.agentId).toBe("agent:workout");
  });
});
