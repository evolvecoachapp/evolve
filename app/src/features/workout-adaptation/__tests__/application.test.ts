import {
  adaptWorkout,
  compareWorkout,
  createWorkoutSnapshot,
  describeWorkoutAdaptation,
  validateWorkoutAdaptation,
} from "../application";
import { WorkoutAdaptationInputKinds } from "../models/WorkoutAdaptationInput";
import { WorkoutOperationKinds } from "../models/WorkoutResult";
import {
  createTestWorkoutAdaptationEngineService,
  createWorkoutAdaptationInput,
} from "../testSupport/fixtures";

describe("workout-adaptation application", () => {
  it("exposes public API adapt → compare → snapshot → validate → describe", () => {
    const service = createTestWorkoutAdaptationEngineService();

    const adapted = adaptWorkout({
      service,
      input: createWorkoutAdaptationInput({ kind: WorkoutAdaptationInputKinds.ADAPT }),
    });
    expect(adapted.success).toBe(true);
    expect(adapted.operation).toBe(WorkoutOperationKinds.ADAPT);
    expect(adapted.adaptation).not.toBeNull();
    expect(adapted.updatedBlueprint).not.toBeNull();
    expect(adapted.runtimeInput).not.toBeNull();
    expect(Object.isFrozen(adapted)).toBe(true);
    expect(Object.isFrozen(adapted.adaptation!)).toBe(true);
    expect(Object.isFrozen(adapted.updatedBlueprint!)).toBe(true);

    const compared = compareWorkout({
      service,
      input: createWorkoutAdaptationInput({
        id: "request:compare",
        kind: WorkoutAdaptationInputKinds.COMPARE,
      }),
    });
    expect(compared.success).toBe(true);
    expect(compared.operation).toBe(WorkoutOperationKinds.COMPARE);
    expect(compared.comparison).not.toBeNull();

    const snap = createWorkoutSnapshot({
      service,
      input: createWorkoutAdaptationInput({
        id: "request:snapshot",
        kind: WorkoutAdaptationInputKinds.SNAPSHOT,
      }),
    });
    expect(snap.success).toBe(true);
    expect(snap.snapshot).not.toBeNull();
    expect(Object.isFrozen(snap.snapshot!)).toBe(true);

    const validated = validateWorkoutAdaptation({
      service,
      input: createWorkoutAdaptationInput({
        id: "request:validate",
        kind: WorkoutAdaptationInputKinds.VALIDATE,
      }),
    });
    expect(validated.success).toBe(true);

    const caps = describeWorkoutAdaptation({ service });
    expect(caps.name).toBe("Workout Adaptation Engine");
    expect(caps.capabilities).toEqual(
      expect.arrayContaining([
        "adaptWorkout",
        "compareWorkout",
        "describeWorkoutAdaptation",
        "createWorkoutSnapshot",
        "validateWorkoutAdaptation",
      ]),
    );
  });

  it("rejects adaptation without existing blueprint id", () => {
    const service = createTestWorkoutAdaptationEngineService();
    const result = adaptWorkout({
      service,
      input: createWorkoutAdaptationInput({ blueprintId: "" }),
    });
    expect(result.success).toBe(false);
    expect(result.errors.some((e) => e.code === "missing_blueprint")).toBe(true);
  });
});
