import { IntentSelector } from "../selectors/IntentSelector";
import { GoalSelector } from "../selectors/GoalSelector";
import { StrategySelector } from "../selectors/StrategySelector";
import { ConstraintSelector } from "../selectors/ConstraintSelector";
import { PlannerSelector } from "../selectors/PlannerSelector";
import { RecoveryContextBuilder } from "../builders/RecoveryContextBuilder";
import { RecoveryIntents } from "../models/RecoveryIntent";
import { RecoveryGoals } from "../models/RecoveryGoal";
import {
  createRecoveryRequestFixture,
  createFixedClock,
} from "../testSupport/fixtures";

describe("recovery-agent selectors", () => {
  it("resolves intent, goal, strategy, constraints, planner", () => {
    expect(
      new IntentSelector().select({
        intentHint: null,
        message: "I need sleep advice",
      }),
    ).toBe(RecoveryIntents.SLEEP_ADVICE);

    expect(
      new GoalSelector().select({
        goalHint: null,
        intent: RecoveryIntents.STRESS_ADVICE,
        message: "help",
      }),
    ).toBe(RecoveryGoals.STRESS_REDUCTION);

    const strategy = new StrategySelector().select(
      RecoveryGoals.ACTIVE_RECOVERY,
    );
    expect(strategy.id).toContain("active_recovery");

    const constraints = new ConstraintSelector().select([
      "medical",
      "avoid_deload",
    ]);
    expect(constraints.medicalClearanceRequired).toBe(true);
    expect(constraints.avoidDeload).toBe(true);

    const context = new RecoveryContextBuilder().build({
      request: createRecoveryRequestFixture({
        intentHint: RecoveryIntents.SLEEP_ADVICE,
      }),
      clock: createFixedClock(),
    });
    expect(new PlannerSelector().select(context).id).toContain("sleep");
  });
});
