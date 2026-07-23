import {
  StrategySelector,
  GoalSelector,
  IntentSelector,
  MealSelector,
  MacroSelector,
  NutritionCapabilitySelector,
} from "../selectors";
import { NutritionGoals } from "../models/NutritionGoal";
import { NutritionIntents } from "../models/NutritionIntent";
import { NutritionCapabilities } from "../models/NutritionCapability";
import { NutritionContextBuilder } from "../builders/NutritionContextBuilder";
import {
  createNutritionRequestFixture,
  createFixedClock,
} from "../testSupport/fixtures";

describe("nutrition-agent selectors", () => {
  it("GoalSelector and IntentSelector resolve hints", () => {
    expect(
      new GoalSelector().select({
        goalHint: NutritionGoals.MUSCLE_GAIN,
        intent: NutritionIntents.PLAN_NUTRITION,
        message: "",
      }),
    ).toBe(NutritionGoals.MUSCLE_GAIN);
    expect(
      new IntentSelector().select({
        intentHint: NutritionIntents.HYDRATION,
        message: "",
      }),
    ).toBe(NutritionIntents.HYDRATION);
  });

  it("StrategySelector selects fat loss strategy", () => {
    const strategy = new StrategySelector().select(NutritionGoals.FAT_LOSS);
    expect(strategy.id).toContain("fat_loss");
  });

  it("MealSelector and MacroSelector produce values", () => {
    const context = new NutritionContextBuilder().build({
      request: createNutritionRequestFixture(),
      clock: createFixedClock(),
    });
    expect(new MealSelector().select(context).mealsPerDay).toBeGreaterThan(0);
    expect(new MacroSelector().select(context).proteinG).toBeGreaterThan(0);
  });

  it("NutritionCapabilitySelector maps intents to extensible capabilities", () => {
    const selector = new NutritionCapabilitySelector();
    expect(selector.select(NutritionIntents.HYDRATION)).toEqual([
      NutritionCapabilities.HYDRATION_GUIDANCE,
    ]);
    expect(selector.select(NutritionIntents.SUPPLEMENTATION)).toContain(
      NutritionCapabilities.SUPPLEMENT_GUIDANCE,
    );
  });
});
