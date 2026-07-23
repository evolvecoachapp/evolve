import { WorkoutPlanner } from "../planners/WorkoutPlanner";
import { NutritionPlanner } from "../planners/NutritionPlanner";
import { RecoveryPlanner } from "../planners/RecoveryPlanner";
import { GoalPlanner } from "../planners/GoalPlanner";
import { ReminderPlanner } from "../planners/ReminderPlanner";
import { CompositePlanner } from "../planners/CompositePlanner";
import {
  createRichCoachResponseFixture,
  createEmptyCoachResponseFixture,
  createWorkoutCoachResponseFixture,
} from "../testSupport/fixtures";

describe("action-engine planners", () => {
  const planId = "plan:test";

  it("WorkoutPlanner maps exercises to steps", () => {
    const steps = new WorkoutPlanner().plan(
      createWorkoutCoachResponseFixture(),
      planId,
    );
    expect(steps).toHaveLength(1);
    expect(steps[0].type).toBe("workout");
    expect(steps[0].label).toBe("Bench Press");
    expect(Object.isFrozen(steps[0])).toBe(true);
  });

  it("NutritionPlanner / RecoveryPlanner / GoalPlanner / ReminderPlanner map fields", () => {
    const response = createRichCoachResponseFixture();
    expect(new NutritionPlanner().plan(response, planId)).toHaveLength(1);
    expect(new RecoveryPlanner().plan(response, planId)).toHaveLength(1);
    expect(new GoalPlanner().plan(response, planId)).toHaveLength(1);
    expect(new ReminderPlanner().plan(response, planId)).toHaveLength(1);
  });

  it("CompositePlanner merges planner outputs deterministically", () => {
    const steps = new CompositePlanner().plan(
      createRichCoachResponseFixture(),
      planId,
    );
    expect(steps.length).toBeGreaterThanOrEqual(5);
    const orders = steps.map((s) => s.order);
    expect(orders).toEqual([...orders].sort((a, b) => a - b));
  });

  it("planners return empty arrays for empty responses", () => {
    const empty = createEmptyCoachResponseFixture();
    expect(new WorkoutPlanner().plan(empty, planId)).toHaveLength(0);
    expect(new CompositePlanner().plan(empty, planId)).toHaveLength(0);
  });
});
