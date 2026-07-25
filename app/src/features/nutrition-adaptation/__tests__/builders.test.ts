import { buildNutritionDescriptor } from "../builders/DescriptorBuilder";
import { buildNutritionAdaptation } from "../builders/NutritionAdaptationBuilder";
import { buildNutritionResult } from "../builders/ResultBuilder";
import { NutritionOperationKinds } from "../models/NutritionResult";
import { FIXED_TIMESTAMP } from "../testSupport/fixtures";

describe("nutrition-adaptation builders", () => {
  it("freezes built artifacts", () => {
    const adaptation = buildNutritionAdaptation({
      id: "na:1",
      athleteId: "athlete:1",
      planId: "plan:1",
      contextId: "context:1",
      decisionKeys: Object.freeze(["decision:key:calorie"]),
      signalKeys: Object.freeze(["state:hydration"]),
      at: FIXED_TIMESTAMP,
    });
    expect(Object.isFrozen(adaptation)).toBe(true);

    const descriptor = buildNutritionDescriptor({
      id: "runtime:test",
      createdAt: FIXED_TIMESTAMP,
    });
    expect(descriptor.version).toBe("24.2.0");
    expect(Object.isFrozen(descriptor)).toBe(true);

    const result = buildNutritionResult({
      id: "result:1",
      operation: NutritionOperationKinds.ADAPT,
      success: true,
      adaptation,
      createdAt: FIXED_TIMESTAMP,
    });
    expect(Object.isFrozen(result)).toBe(true);
  });
});
