import {
  buildWorkoutPlan,
  describeWorkoutCapabilities,
  evaluateWorkout,
  processWorkoutRequest,
  validateWorkoutPlan,
} from "../application";
import {
  createTestAgentService,
  createWorkoutRequestFixture,
  FIXED_TIMESTAMP,
} from "../testSupport/fixtures";

describe("workout-agent application", () => {
  it("describeWorkoutCapabilities returns frozen agent", () => {
    const service = createTestAgentService();
    const agent = describeWorkoutCapabilities({ service });
    expect(agent.name).toBe("Workout Agent");
    expect(agent.capabilities.length).toBeGreaterThan(0);
    expect(Object.isFrozen(agent)).toBe(true);
  });

  it("processWorkoutRequest returns immutable result", () => {
    const service = createTestAgentService();
    const result = processWorkoutRequest({
      service,
      request: createWorkoutRequestFixture(),
    });
    expect(result.success).toBe(true);
    expect(result.decision.accepted).toBe(true);
    expect(result.decision.proposal).not.toBeNull();
    expect(Object.isFrozen(result)).toBe(true);
    expect(result.startedAt).toBe(FIXED_TIMESTAMP);
  });

  it("buildWorkoutPlan / evaluate / validate work via public API", () => {
    const service = createTestAgentService();
    const proposal = buildWorkoutPlan({
      service,
      request: createWorkoutRequestFixture(),
    });
    expect(proposal.split).toBeTruthy();
    expect(evaluateWorkout({ service, proposal }).valid).toBe(true);
    expect(validateWorkoutPlan({ service, proposal }).valid).toBe(true);
  });
});
