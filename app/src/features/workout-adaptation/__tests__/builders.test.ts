import { buildWorkoutDescriptor } from "../builders/DescriptorBuilder";
import { buildWorkoutResult } from "../builders/ResultBuilder";
import { buildWorkoutAdaptation } from "../builders/WorkoutAdaptationBuilder";
import { WorkoutOperationKinds } from "../models/WorkoutResult";
import { FIXED_TIMESTAMP } from "../testSupport/fixtures";

describe("workout-adaptation builders", () => {
  it("freezes built artifacts", () => {
    const adaptation = buildWorkoutAdaptation({
      id: "wa:1",
      athleteId: "athlete:1",
      blueprintId: "blueprint:1",
      contextId: "context:1",
      decisionKeys: Object.freeze(["decision:key:volume"]),
      signalKeys: Object.freeze(["state:fatigue"]),
      at: FIXED_TIMESTAMP,
    });
    expect(Object.isFrozen(adaptation)).toBe(true);

    const descriptor = buildWorkoutDescriptor({
      id: "runtime:test",
      createdAt: FIXED_TIMESTAMP,
    });
    expect(descriptor.version).toBe("24.1.0");
    expect(Object.isFrozen(descriptor)).toBe(true);

    const result = buildWorkoutResult({
      id: "result:1",
      operation: WorkoutOperationKinds.ADAPT,
      success: true,
      adaptation,
      createdAt: FIXED_TIMESTAMP,
    });
    expect(Object.isFrozen(result)).toBe(true);
  });
});
