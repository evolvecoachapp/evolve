import {
  adaptNutrition,
  compareNutrition,
  createNutritionSnapshot,
  describeNutritionAdaptation,
  validateNutritionAdaptation,
} from "../application";
import * as publicApi from "../index";
import { NutritionAdaptationInputKinds } from "../models/NutritionAdaptationInput";
import {
  createNutritionAdaptationInput,
  createTestNutritionAdaptationEngineService,
  FIXED_TIMESTAMP,
} from "../testSupport/fixtures";

describe("nutrition-adaptation regression", () => {
  it("keeps public root surface limited to models + application + service", () => {
    expect(typeof publicApi.adaptNutrition).toBe("function");
    expect(typeof publicApi.compareNutrition).toBe("function");
    expect(typeof publicApi.describeNutritionAdaptation).toBe("function");
    expect(typeof publicApi.createNutritionSnapshot).toBe("function");
    expect(typeof publicApi.validateNutritionAdaptation).toBe("function");
    expect(publicApi.NutritionAdaptationEngineService).toBeDefined();
    expect(typeof publicApi.createNutritionAdaptationEngineService).toBe("function");
    expect(publicApi.NutritionAdaptationInputKinds).toBeDefined();
    expect((publicApi as Record<string, unknown>).NutritionAdaptationCoordinator).toBeUndefined();
    expect((publicApi as Record<string, unknown>).adaptMeal).toBeUndefined();
    expect((publicApi as Record<string, unknown>).evaluateCalorie).toBeUndefined();
  });

  it("is deterministic for fixed clock + fixtures", () => {
    const service = createTestNutritionAdaptationEngineService();
    const input = createNutritionAdaptationInput({ kind: NutritionAdaptationInputKinds.ADAPT });
    const a = adaptNutrition({ service, input });
    const b = adaptNutrition({
      service: createTestNutritionAdaptationEngineService(),
      input,
    });
    expect(a.success).toBe(true);
    expect(b.success).toBe(true);
    expect(a.createdAt).toBe(FIXED_TIMESTAMP);
    expect(a.adaptation!.id).toBe(b.adaptation!.id);
    expect(a.adaptation!.decisionKeys).toEqual(b.adaptation!.decisionKeys);
    expect(a.updatedPlan!.id).toBe(b.updatedPlan!.id);
    expect(a.updatedPlan!.modificationIds).toEqual(b.updatedPlan!.modificationIds);
    expect(a.runtimeInput!.id).toBe(b.runtimeInput!.id);

    expect(compareNutrition({ service, input }).success).toBe(true);
    expect(createNutritionSnapshot({ service, input }).success).toBe(true);
    expect(validateNutritionAdaptation({ service, input }).success).toBe(true);
    expect(describeNutritionAdaptation({ service }).version).toBe("24.2.0");
  });

  it("requires existing plan — no AI / no generation from scratch", () => {
    const service = createTestNutritionAdaptationEngineService();
    const missing = adaptNutrition({
      service,
      input: createNutritionAdaptationInput({ planId: "" }),
    });
    expect(missing.success).toBe(false);

    const caps = describeNutritionAdaptation({ service });
    expect(caps.boundaries).toEqual(
      expect.arrayContaining([
        "no_ai",
        "no_nutrition_generation_from_scratch",
        "adapts_existing_plan_only",
      ]),
    );
  });
});
