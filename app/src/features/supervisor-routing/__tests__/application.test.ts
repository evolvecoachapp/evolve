import {
  buildRoutingPlan,
  resolveRouting,
  validateRoutingPlan,
  describeRouting,
  buildRoutingSnapshot,
} from "../application";
import { RoutingOperationKinds } from "../models/RoutingResult";
import {
  createTestRoutingService,
  createRoutingRequest,
} from "../testSupport/fixtures";

describe("supervisor-routing application", () => {
  it("exposes public API build → resolve → validate → describe → snapshot", () => {
    const service = createTestRoutingService();
    const request = createRoutingRequest();

    const built = buildRoutingPlan({ service, request });
    expect(built.success).toBe(true);
    expect(built.operation).toBe(RoutingOperationKinds.BUILD_PLAN);
    expect(built.plan).not.toBeNull();

    const resolved = resolveRouting({ service, request });
    expect(resolved.success).toBe(true);
    expect(resolved.operation).toBe(RoutingOperationKinds.RESOLVE);

    const validated = validateRoutingPlan({ service, plan: built.plan! });
    expect(validated.success).toBe(true);
    expect(validated.operation).toBe(RoutingOperationKinds.VALIDATE);

    const described = describeRouting({ service, plan: built.plan! });
    expect(described.success).toBe(true);
    expect(described.description).toContain("Routing plan");

    const snapshot = buildRoutingSnapshot({
      service,
      plan: built.plan!,
      request,
      snapshotId: "snapshot:public",
    });
    expect(snapshot.success).toBe(true);
    expect(snapshot.snapshot?.id).toBe("snapshot:public");
    expect(snapshot.snapshot?.agentIds).toEqual([
      "agent:recovery",
      "agent:workout",
    ]);
  });
});
