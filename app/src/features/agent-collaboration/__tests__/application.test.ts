import {
  createCollaborationPlan,
  dispatchCollaboration,
  executeCollaboration,
  aggregateResults,
  buildCollaborationSnapshot,
} from "../application";
import { CollaborationOperationKinds } from "../models/CollaborationResult";
import { CollaborationRoles } from "../models/CollaborationRole";
import {
  createCoachRequest,
  createTestCollaborationService,
  createTrackingHandler,
  FIXED_TIMESTAMP,
} from "../testSupport/fixtures";

describe("agent-collaboration application", () => {
  it("exposes public API for plan → dispatch → aggregate → snapshot", async () => {
    const service = createTestCollaborationService();
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

    const request = createCoachRequest();
    const planned = createCollaborationPlan({ service, request });
    expect(planned.success).toBe(true);
    expect(planned.operation).toBe(CollaborationOperationKinds.PLAN);
    expect(planned.plan?.participants).toHaveLength(3);
    expect(Object.isFrozen(planned)).toBe(true);

    const dispatched = await dispatchCollaboration({
      service,
      plan: planned.plan!,
    });
    expect(dispatched.success).toBe(true);
    expect(dispatched.results).toHaveLength(3);
    expect(callOrder).toEqual(["workout", "nutrition", "recovery"]);

    const aggregated = aggregateResults({ service });
    expect(aggregated.success).toBe(true);
    expect(aggregated.aggregation?.orderedAgentIds).toEqual([
      "agent:workout",
      "agent:nutrition",
      "agent:recovery",
    ]);

    const snapshot = buildCollaborationSnapshot({ service });
    expect(snapshot.snapshot?.resultCount).toBe(3);
    expect(snapshot.startedAt).toBe(FIXED_TIMESTAMP);
  });

  it("executeCollaboration runs full lifecycle", async () => {
    const service = createTestCollaborationService();
    const result = await executeCollaboration({
      service,
      request: createCoachRequest({
        requestedRoles: [CollaborationRoles.WORKOUT],
      }),
    });

    expect(result.success).toBe(true);
    expect(result.operation).toBe(CollaborationOperationKinds.EXECUTE);
    expect(result.plan?.participants).toHaveLength(1);
    expect(result.results).toHaveLength(1);
    expect(result.aggregation?.successCount).toBe(1);
    expect(result.snapshot?.participantCount).toBe(1);
  });
});
