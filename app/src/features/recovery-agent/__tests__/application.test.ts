import {
  buildRecoveryPlan,
  describeRecoveryCapabilities,
  evaluateRecovery,
  processRecoveryRequest,
  validateRecoveryPlan,
} from "../application";
import {
  createTestAgentService,
  createRecoveryRequestFixture,
  FIXED_TIMESTAMP,
} from "../testSupport/fixtures";

describe("recovery-agent application", () => {
  it("describeRecoveryCapabilities returns frozen agent", () => {
    const service = createTestAgentService();
    const agent = describeRecoveryCapabilities({ service });
    expect(agent.name).toBe("Recovery Agent");
    expect(agent.capabilities.length).toBeGreaterThan(0);
    expect(Object.isFrozen(agent)).toBe(true);
  });

  it("processRecoveryRequest returns immutable result", () => {
    const service = createTestAgentService();
    const result = processRecoveryRequest({
      service,
      request: createRecoveryRequestFixture(),
    });
    expect(result.success).toBe(true);
    expect(result.decision.accepted).toBe(true);
    expect(result.decision.plan).not.toBeNull();
    expect(Object.isFrozen(result)).toBe(true);
    expect(result.startedAt).toBe(FIXED_TIMESTAMP);
  });

  it("buildRecoveryPlan / evaluate / validate work via public API", () => {
    const service = createTestAgentService();
    const plan = buildRecoveryPlan({
      service,
      request: createRecoveryRequestFixture(),
    });
    expect(plan.protocolHint).toBeTruthy();
    expect(evaluateRecovery({ service, plan }).valid).toBe(true);
    expect(validateRecoveryPlan({ service, plan }).valid).toBe(true);
  });
});
