import {
  createDefaultPlanners,
  NutritionPlannerImpl,
  CutPlanner,
  BulkPlanner,
} from "../planning";
import { NutritionContextBuilder } from "../builders/NutritionContextBuilder";
import { createDefaultReasoners } from "../reasoning";
import {
  createNutritionRequestFixture,
  createFixedClock,
} from "../testSupport/fixtures";
import { NutritionGoals } from "../models/NutritionGoal";

describe("nutrition-agent planners", () => {
  const clock = createFixedClock();
  const context = new NutritionContextBuilder().build({
    request: createNutritionRequestFixture(),
    clock,
  });
  const reasoning = createDefaultReasoners().map((r) => r.reason(context));

  it("creates default planners", () => {
    expect(createDefaultPlanners().length).toBeGreaterThanOrEqual(12);
  });

  it("NutritionPlannerImpl produces immutable plan", () => {
    const result = new NutritionPlannerImpl().plan(context, reasoning, clock);
    expect(result.success).toBe(true);
    expect(result.plan.goal).toBe(NutritionGoals.FAT_LOSS);
    expect(Object.isFrozen(result.plan)).toBe(true);
  });

  it("CutPlanner and BulkPlanner set phase hints", () => {
    const cut = CutPlanner.plan(context, reasoning, clock);
    const bulk = BulkPlanner.plan(context, reasoning, clock);
    expect(cut.plan.phaseHint).toBe("cut");
    expect(bulk.plan.phaseHint).toBe("bulk");
  });
});
