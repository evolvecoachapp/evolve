import { executeCollaboration } from "../application";
import {
  createCoachRequest,
  createTestCollaborationService,
  createTrackingHandler,
} from "../testSupport/fixtures";

describe("agent-collaboration integration", () => {
  it("Coach request → plan → ordered dispatch → aggregate → snapshot", async () => {
    const service = createTestCollaborationService({
      collaborationId: "collaboration:integration",
    });
    const callOrder: string[] = [];
    service.registerHandler(
      "agent:workout",
      createTrackingHandler("workout", callOrder),
    );
    service.registerHandler(
      "agent:nutrition",
      createTrackingHandler("nutrition", callOrder),
    );
    service.registerHandler(
      "agent:recovery",
      createTrackingHandler("recovery", callOrder),
    );

    const result = await executeCollaboration({
      service,
      request: createCoachRequest({ id: "req:integration" }),
    });

    expect(result.success).toBe(true);
    expect(callOrder).toEqual(["workout", "nutrition", "recovery"]);
    expect(result.plan?.batches[0]?.taskIds).toHaveLength(3);
    expect(result.aggregation?.provenance).toHaveLength(3);
    expect(result.snapshot?.status).toBe("completed");
    expect(result.events.map((e) => e.sequence)).toEqual(
      result.events.map((_, i) => i + 1),
    );
  });
});
