import { NutritionContextBuilder } from "../builders/NutritionContextBuilder";
import { NutritionPlanBuilder } from "../builders/NutritionPlanBuilder";
import { RecommendationBuilder } from "../builders/RecommendationBuilder";
import { MealPlanBuilder } from "../builders/MealPlanBuilder";
import { MacroPlanBuilder } from "../builders/MacroPlanBuilder";
import {
  createNutritionRequestFixture,
  createFixedClock,
  createMockCoachResponse,
} from "../testSupport/fixtures";
import { labelFromScore } from "../models/NutritionConfidence";
import { EMPTY_NUTRITION_AGENT_METADATA } from "../models/NutritionMetadata";

describe("nutrition-agent builders", () => {
  const clock = createFixedClock();

  it("NutritionContextBuilder freezes context", () => {
    const context = new NutritionContextBuilder().build({
      request: createNutritionRequestFixture(),
      coachResponse: createMockCoachResponse(),
      clock,
    });
    expect(Object.isFrozen(context)).toBe(true);
    expect(context.coachResponseId).toBe("coach:resp:1");
  });

  it("NutritionPlanBuilder builds proposal", () => {
    const context = new NutritionContextBuilder().build({
      request: createNutritionRequestFixture(),
      clock,
    });
    const plan = new NutritionPlanBuilder().buildProposal({ context, clock });
    expect(plan.calorieTargets.targetCalories).toBeGreaterThan(0);
    expect(Object.isFrozen(plan)).toBe(true);
  });

  it("RecommendationBuilder / MealPlanBuilder / MacroPlanBuilder work", () => {
    const context = new NutritionContextBuilder().build({
      request: createNutritionRequestFixture(),
      clock,
    });
    const plan = new NutritionPlanBuilder().buildProposal({ context, clock });
    const decision = Object.freeze({
      id: "nd:1",
      intent: context.intent,
      goal: context.goal,
      strategyId: context.strategy?.id ?? null,
      plan,
      accepted: true,
      confidence: Object.freeze({
        score: 0.8,
        label: labelFromScore(0.8),
        rationale: null,
      }),
      reasons: Object.freeze([] as string[]),
      policyFlags: Object.freeze([] as string[]),
      metadata: EMPTY_NUTRITION_AGENT_METADATA,
      decidedAt: clock(),
    });
    const recs = new RecommendationBuilder().build({ decision, plan });
    expect(recs.length).toBeGreaterThan(0);
    expect(new MealPlanBuilder().build(context).mealsPerDay).toBeGreaterThan(0);
    expect(new MacroPlanBuilder().build(context).proteinG).toBeGreaterThan(0);
  });
});
