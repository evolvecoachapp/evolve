import { createCollaborationPlan, executeCollaboration } from "../application";
import { CollaborationRoles } from "../models/CollaborationRole";
import {
  createCoachRequest,
  createTestCollaborationService,
} from "../testSupport/fixtures";

describe("agent-collaboration regression", () => {
  it("does not invent participants beyond requested specialists", async () => {
    const service = createTestCollaborationService();
    const planned = createCollaborationPlan({
      service,
      request: createCoachRequest({
        requestedRoles: [CollaborationRoles.NUTRITION],
        requestedAgentIds: [],
      }),
    });

    expect(planned.plan?.participants).toHaveLength(1);
    expect(planned.plan?.participants[0]?.role).toBe(
      CollaborationRoles.NUTRITION,
    );
  });

  it("shell handlers remain metadata-only (no domain payload fabrication)", async () => {
    const service = createTestCollaborationService();
    const result = await executeCollaboration({
      service,
      request: createCoachRequest({
        requestedRoles: [CollaborationRoles.WORKOUT],
      }),
    });

    expect(result.results[0]?.attributes.executor).toBe("shell");
    expect(result.results[0]?.attributes.intent).toBe("coordinate specialists");
    expect(result.aggregation?.metadata).toBeDefined();
  });

  it("rejects invalid requests without mutating engine plan", () => {
    const service = createTestCollaborationService();
    const failed = createCollaborationPlan({
      service,
      request: createCoachRequest({
        intent: "   ",
        requestedRoles: [CollaborationRoles.WORKOUT],
      }),
    });

    expect(failed.success).toBe(false);
    expect(service.getEngine().getPlan()).toBeNull();
  });
});
