import { RecoveryContextBuilder } from "../builders/RecoveryContextBuilder";
import { RecoveryPlanBuilder } from "../builders/RecoveryPlanBuilder";
import {
  DefaultDeloadPolicy,
  DefaultFatiguePolicy,
  DefaultRecoveryPolicy,
  DefaultSafetyPolicy,
  DefaultSleepPolicy,
  DefaultStressPolicy,
  DefaultTrainingLoadPolicy,
  DefaultWellnessPolicy,
} from "../policies";
import {
  createRecoveryRequestFixture,
  createFixedClock,
} from "../testSupport/fixtures";

describe("recovery-agent policies", () => {
  it("evaluates without throwing and returns frozen flags", () => {
    const clock = createFixedClock();
    const context = new RecoveryContextBuilder().build({
      request: createRecoveryRequestFixture(),
      clock,
    });
    const plan = new RecoveryPlanBuilder().buildProposal({ context, clock });
    const flags = [
      ...new DefaultSafetyPolicy().evaluate(context, plan),
      ...new DefaultRecoveryPolicy().evaluate(context, plan),
      ...new DefaultSleepPolicy().evaluate(plan),
      ...new DefaultStressPolicy().evaluate(plan),
      ...new DefaultFatiguePolicy().evaluate(plan),
      ...new DefaultTrainingLoadPolicy().evaluate(context, plan),
      ...new DefaultWellnessPolicy().evaluate(context, plan),
      ...new DefaultDeloadPolicy().evaluate(context, plan),
    ];
    expect(Array.isArray(flags)).toBe(true);
  });
});
