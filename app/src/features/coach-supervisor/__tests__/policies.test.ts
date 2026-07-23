import { applyAggregationPolicy } from "../policies/AggregationPolicy";
import { applyCapabilityPolicy } from "../policies/CapabilityPolicy";
import { applyCoordinationPolicy } from "../policies/CoordinationPolicy";
import { applySafetyPolicy } from "../policies/SafetyPolicy";
import { createMockRoutingPort } from "../contracts/RoutingPort";
import { createCoordinationPlanner } from "../planning/CoordinationPlanner";
import { buildAggregationContext, buildAggregationResult } from "../builders/AggregationBuilder";
import { createMockCollaborationPort } from "../contracts/CollaborationPort";
import {
  createFixedClock,
  createSupervisorRequest,
  FIXED_TIMESTAMP,
} from "../testSupport/fixtures";

describe("coach-supervisor policies", () => {
  it("applies deterministic policies", () => {
    const request = createSupervisorRequest();
    expect(applySafetyPolicy(request).valid).toBe(true);
    expect(applyCapabilityPolicy(request).valid).toBe(true);

    const routing = createMockRoutingPort().resolve(request);
    const plan = createCoordinationPlanner().plan({
      request,
      routing,
      planId: "cplan:p",
      createdAt: FIXED_TIMESTAMP,
    });
    expect(applyCoordinationPolicy(plan).valid).toBe(true);

    const executed = createMockCollaborationPort().execute({
      plan,
      clock: createFixedClock(),
    });
    const context = buildAggregationContext({
      id: "actx:p",
      plan,
      summaries: executed.summaries,
      createdAt: FIXED_TIMESTAMP,
    });
    const aggregation = buildAggregationResult({
      id: "agg:p",
      context,
      createdAt: FIXED_TIMESTAMP,
    });
    expect(applyAggregationPolicy(aggregation).valid).toBe(true);
  });
});
