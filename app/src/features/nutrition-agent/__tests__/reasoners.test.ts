import {
  createDefaultReasoners,
  CalorieReasoner,
  GoalReasoner,
  ProteinReasoner,
} from "../reasoning";
import { NutritionContextBuilder } from "../builders/NutritionContextBuilder";
import {
  createNutritionRequestFixture,
  createFixedClock,
} from "../testSupport/fixtures";
import { NutritionGoals } from "../models/NutritionGoal";

describe("nutrition-agent reasoners", () => {
  const context = new NutritionContextBuilder().build({
    request: createNutritionRequestFixture(),
    clock: createFixedClock(),
  });

  it("creates default reasoners", () => {
    expect(createDefaultReasoners().length).toBeGreaterThanOrEqual(14);
  });

  it("GoalReasoner resolves goal", () => {
    const result = new GoalReasoner().reason(context);
    expect(result.topic).toBe("goal");
    expect(
      result.findings.some((f) => f.includes(NutritionGoals.FAT_LOSS)),
    ).toBe(true);
    expect(Object.isFrozen(result)).toBe(true);
  });

  it("CalorieReasoner and ProteinReasoner produce signals", () => {
    const calories = new CalorieReasoner().reason(context);
    const protein = new ProteinReasoner().reason(context);
    expect(calories.signals.calorie_target).toBeGreaterThan(0);
    expect(protein.signals.protein_g).toBeGreaterThan(0);
  });
});
