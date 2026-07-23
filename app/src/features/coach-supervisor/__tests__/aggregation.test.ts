import { createConflictResolver } from "../aggregation/ConflictResolver";
import { createExplanationAggregator } from "../aggregation/ExplanationAggregator";
import { createResultAggregator } from "../aggregation/ResultAggregator";
import { createResponseAggregator } from "../aggregation/ResponseAggregator";
import { buildAggregationContext } from "../builders/AggregationBuilder";
import { createMockRoutingPort } from "../contracts/RoutingPort";
import { createMockCollaborationPort } from "../contracts/CollaborationPort";
import { createCoordinationPlanner } from "../planning/CoordinationPlanner";
import {
  createFixedClock,
  createSupervisorRequest,
  FIXED_TIMESTAMP,
} from "../testSupport/fixtures";

describe("coach-supervisor aggregation", () => {
  it("aggregates summaries into UnifiedCoachResponse without AI", () => {
    const request = createSupervisorRequest();
    const routing = createMockRoutingPort().resolve(request);
    const plan = createCoordinationPlanner().plan({
      request,
      routing,
      planId: "cplan:agg",
      createdAt: FIXED_TIMESTAMP,
    });
    const executed = createMockCollaborationPort().execute({
      plan,
      clock: createFixedClock(),
    });

    const context = buildAggregationContext({
      id: "actx:1",
      plan,
      summaries: executed.summaries,
      createdAt: FIXED_TIMESTAMP,
    });
    const explanations = createExplanationAggregator().aggregate(
      executed.summaries,
    );
    const conflicts = createConflictResolver().resolve(executed.summaries);
    const aggregation = createResultAggregator().aggregate({
      id: "agg:1",
      context,
      explanations,
      conflicts,
      createdAt: FIXED_TIMESTAMP,
    });
    expect(aggregation.success).toBe(true);
    expect(conflicts).toEqual([]);

    const response = createResponseAggregator().aggregate({
      id: "uresp:1",
      request,
      aggregation,
      createdAt: FIXED_TIMESTAMP,
    });
    expect(response.sections.length).toBe(2);
    expect(response.message).toContain("Unified coach response");
  });
});
