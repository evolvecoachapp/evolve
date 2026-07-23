import { RecoveryContextBuilder } from "../builders/RecoveryContextBuilder";
import { RecoveryPlanBuilder } from "../builders/RecoveryPlanBuilder";
import { RecoveryAssessmentBuilder } from "../builders/RecoveryAssessmentBuilder";
import {
  createRecoveryRequestFixture,
  createMockCoachResponse,
  createMockActionPlan,
  createMockToolExecutionResult,
  createFixedClock,
} from "../testSupport/fixtures";

describe("recovery-agent builders", () => {
  it("builds frozen context with shared runtime artifacts", () => {
    const context = new RecoveryContextBuilder().build({
      request: createRecoveryRequestFixture(),
      coachResponse: createMockCoachResponse(),
      actionPlan: createMockActionPlan(),
      toolExecutionResult: createMockToolExecutionResult(),
      memoryTurnCount: 2,
      clock: createFixedClock(),
    });
    expect(Object.isFrozen(context)).toBe(true);
    expect(context.coachResponseId).toBe("coach:resp:1");
    expect(context.actionPlanId).toBe("action:plan:1");
    expect(context.toolResultIds).toContain("texec:result:1");
    expect(context.memoryTurnCount).toBe(2);
  });

  it("builds plan and assessment", () => {
    const clock = createFixedClock();
    const context = new RecoveryContextBuilder().build({
      request: createRecoveryRequestFixture(),
      clock,
    });
    const plan = new RecoveryPlanBuilder().buildProposal({ context, clock });
    expect(Object.isFrozen(plan)).toBe(true);
    const assessment = new RecoveryAssessmentBuilder().build({
      context,
      clock,
    });
    expect(assessment.recoveryScore.score).toBeGreaterThanOrEqual(0);
  });
});
