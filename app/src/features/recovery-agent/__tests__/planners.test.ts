import { RecoveryContextBuilder } from "../builders/RecoveryContextBuilder";
import { createDefaultReasoners } from "../reasoning";
import { createDefaultPlanners } from "../planning";
import {
  createRecoveryRequestFixture,
  createFixedClock,
} from "../testSupport/fixtures";

describe("recovery-agent planners", () => {
  it("each planner returns a frozen planning result", () => {
    const clock = createFixedClock();
    const context = new RecoveryContextBuilder().build({
      request: createRecoveryRequestFixture(),
      clock,
    });
    const reasoning = createDefaultReasoners().map((r) => r.reason(context));
    for (const planner of createDefaultPlanners()) {
      const result = planner.plan(context, reasoning, clock);
      expect(Object.isFrozen(result)).toBe(true);
      expect(Object.isFrozen(result.plan)).toBe(true);
      expect(result.plan.assessment).toBeTruthy();
    }
  });
});
