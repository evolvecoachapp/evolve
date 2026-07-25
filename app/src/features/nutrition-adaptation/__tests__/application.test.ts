import {
  adaptNutrition,
  compareNutrition,
  createNutritionSnapshot,
  describeNutritionAdaptation,
  validateNutritionAdaptation,
} from "../application";
import { NutritionAdaptationInputKinds } from "../models/NutritionAdaptationInput";
import { NutritionOperationKinds } from "../models/NutritionResult";
import {
  createNutritionAdaptationInput,
  createTestNutritionAdaptationEngineService,
} from "../testSupport/fixtures";

describe("nutrition-adaptation application", () => {
  it("exposes public API adapt → compare → snapshot → validate → describe", () => {
    const service = createTestNutritionAdaptationEngineService();

    const adapted = adaptNutrition({
      service,
      input: createNutritionAdaptationInput({ kind: NutritionAdaptationInputKinds.ADAPT }),
    });
    expect(adapted.success).toBe(true);
    expect(adapted.operation).toBe(NutritionOperationKinds.ADAPT);
    expect(adapted.adaptation).not.toBeNull();
    expect(adapted.updatedPlan).not.toBeNull();
    expect(adapted.runtimeInput).not.toBeNull();
    expect(Object.isFrozen(adapted)).toBe(true);
    expect(Object.isFrozen(adapted.adaptation!)).toBe(true);
    expect(Object.isFrozen(adapted.updatedPlan!)).toBe(true);

    const compared = compareNutrition({
      service,
      input: createNutritionAdaptationInput({
        id: "request:compare",
        kind: NutritionAdaptationInputKinds.COMPARE,
      }),
    });
    expect(compared.success).toBe(true);
    expect(compared.operation).toBe(NutritionOperationKinds.COMPARE);
    expect(compared.comparison).not.toBeNull();

    const snap = createNutritionSnapshot({
      service,
      input: createNutritionAdaptationInput({
        id: "request:snapshot",
        kind: NutritionAdaptationInputKinds.SNAPSHOT,
      }),
    });
    expect(snap.success).toBe(true);
    expect(snap.snapshot).not.toBeNull();
    expect(Object.isFrozen(snap.snapshot!)).toBe(true);

    const validated = validateNutritionAdaptation({
      service,
      input: createNutritionAdaptationInput({
        id: "request:validate",
        kind: NutritionAdaptationInputKinds.VALIDATE,
      }),
    });
    expect(validated.success).toBe(true);

    const caps = describeNutritionAdaptation({ service });
    expect(caps.name).toBe("Nutrition Adaptation Engine");
    expect(caps.capabilities).toEqual(
      expect.arrayContaining([
        "adaptNutrition",
        "compareNutrition",
        "describeNutritionAdaptation",
        "createNutritionSnapshot",
        "validateNutritionAdaptation",
      ]),
    );
  });

  it("rejects adaptation without existing plan id", () => {
    const service = createTestNutritionAdaptationEngineService();
    const result = adaptNutrition({
      service,
      input: createNutritionAdaptationInput({ planId: "" }),
    });
    expect(result.success).toBe(false);
    expect(result.errors.some((e) => e.code === "missing_plan")).toBe(true);
  });
});
