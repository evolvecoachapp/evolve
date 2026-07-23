import {
  aggregateResults,
  buildCoordinationPlan,
  describeSupervisorCapabilities,
  processCoachRequest,
  validateSupervisorPlan,
} from "../application";
import { CoachSupervisorOperationKinds } from "../models/CoachSupervisorResult";
import {
  createSupervisorRequest,
  createTestSupervisorService,
} from "../testSupport/fixtures";

describe("coach-supervisor application", () => {
  it("exposes public API process → plan → aggregate → describe → validate", () => {
    const service = createTestSupervisorService();
    const request = createSupervisorRequest();

    const processed = processCoachRequest({ service, request });
    expect(processed.success).toBe(true);
    expect(processed.operation).toBe(CoachSupervisorOperationKinds.PROCESS);
    expect(processed.response).not.toBeNull();
    expect(processed.response?.message).toContain("Unified coach response");

    const planned = buildCoordinationPlan({ service, request });
    expect(planned.success).toBe(true);
    expect(planned.plan).not.toBeNull();

    const aggregated = aggregateResults({
      service,
      plan: planned.plan!,
      summaries: processed.execution!.agentSummaries,
    });
    expect(aggregated.operation).toBe(CoachSupervisorOperationKinds.AGGREGATE);
    expect(aggregated.aggregation).not.toBeNull();

    const caps = describeSupervisorCapabilities({ service });
    expect(caps.role).toBe("coach_supervisor");
    expect(caps.capabilities.length).toBeGreaterThan(0);

    const validated = validateSupervisorPlan({
      service,
      plan: planned.plan!,
    });
    expect(validated.valid).toBe(true);
  });
});
