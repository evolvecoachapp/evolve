import { adaptNutrition, createNutritionSnapshot } from "../application";
import { createMockAthleteStatePort } from "../contracts/AthleteStatePort";
import { createMockCoachContextPort } from "../contracts/CoachContextPort";
import { createMockContinuousAdaptationPort } from "../contracts/ContinuousAdaptationPort";
import { createMockNutritionPlanPort } from "../contracts/NutritionPlanPort";
import { createMockNutritionRuntimePort } from "../contracts/NutritionRuntimePort";
import { createNutritionAdaptationEngineService } from "../services";
import {
  createFixedClock,
  createNutritionAdaptationInput,
  FIXED_TIMESTAMP,
} from "../testSupport/fixtures";

describe("nutrition-adaptation integration", () => {
  it("resolves upstream ports and produces runtime handoff", () => {
    const service = createNutritionAdaptationEngineService({
      nutritionPlanPort: createMockNutritionPlanPort(),
      nutritionRuntimePort: createMockNutritionRuntimePort(),
      athleteStatePort: createMockAthleteStatePort(),
      continuousAdaptationPort: createMockContinuousAdaptationPort(),
      coachContextPort: createMockCoachContextPort(),
      clock: createFixedClock(),
    });

    const input = createNutritionAdaptationInput({
      planKeys: Object.freeze([]),
      mealKeys: Object.freeze([]),
      macroKeys: Object.freeze([]),
      timingKeys: Object.freeze([]),
      weekKeys: Object.freeze([]),
      dayKeys: Object.freeze([]),
      decisionKeys: Object.freeze([]),
      signalKeys: Object.freeze([]),
    });

    const result = adaptNutrition({ service, input });
    expect(result.success).toBe(true);
    expect(result.createdAt).toBe(FIXED_TIMESTAMP);
    expect(result.updatedPlan?.planId).toBe("plan:1");
    expect(result.updatedPlan!.mealKeys.length).toBeGreaterThan(0);
    expect(result.runtimeInput?.updatedPlanId).toBe(result.updatedPlan!.id);
    expect(result.adaptation!.decisionKeys.length).toBeGreaterThan(0);

    const snap = createNutritionSnapshot({ service, input });
    expect(snap.success).toBe(true);
    expect(snap.snapshot?.modificationIds.length).toBeGreaterThan(0);
  });

  it("does not generate from empty plan without keys or port data", () => {
    const service = createNutritionAdaptationEngineService({
      clock: createFixedClock(),
    });
    const result = adaptNutrition({
      service,
      input: createNutritionAdaptationInput({
        planKeys: Object.freeze([]),
        mealKeys: Object.freeze([]),
        macroKeys: Object.freeze([]),
        timingKeys: Object.freeze([]),
        weekKeys: Object.freeze([]),
        dayKeys: Object.freeze([]),
      }),
    });
    expect(result.success).toBe(false);
    expect(result.errors.some((e) => e.code === "empty_plan")).toBe(true);
  });
});
