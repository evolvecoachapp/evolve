import { processRecoveryRequest, buildRecoveryPlan } from "../application";
import {
  createTestAgentService,
  createRecoveryRequestFixture,
} from "../testSupport/fixtures";

describe("recovery-agent regression", () => {
  it("is deterministic for fixed clock and request", () => {
    const service = createTestAgentService();
    const request = createRecoveryRequestFixture();
    const a = processRecoveryRequest({ service, request });
    const b = processRecoveryRequest({ service, request });
    expect(a.decision.plan?.protocolHint).toBe(b.decision.plan?.protocolHint);
    expect(a.decision.plan?.assessment.recoveryScore.score).toBe(
      b.decision.plan?.assessment.recoveryScore.score,
    );
    const plan = buildRecoveryPlan({ service, request });
    expect(plan.id).toBe(a.decision.plan?.id);
  });
});
