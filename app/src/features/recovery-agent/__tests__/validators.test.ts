import { RecoveryContextBuilder } from "../builders/RecoveryContextBuilder";
import { RecoveryPlanBuilder } from "../builders/RecoveryPlanBuilder";
import { validateRecoveryPlan } from "../validators/validateRecoveryPlan";
import { validateRecoveryScore } from "../validators/validateRecoveryScore";
import {
  createRecoveryRequestFixture,
  createFixedClock,
} from "../testSupport/fixtures";

describe("recovery-agent validators", () => {
  it("accepts a normal plan", () => {
    const clock = createFixedClock();
    const context = new RecoveryContextBuilder().build({
      request: createRecoveryRequestFixture(),
      clock,
    });
    const plan = new RecoveryPlanBuilder().buildProposal({ context, clock });
    expect(validateRecoveryPlan(plan).valid).toBe(true);
  });

  it("rejects out-of-range recovery score", () => {
    expect(validateRecoveryScore(150).valid).toBe(false);
  });
});
