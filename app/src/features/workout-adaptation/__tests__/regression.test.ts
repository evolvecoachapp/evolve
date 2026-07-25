import {
  adaptWorkout,
  compareWorkout,
  createWorkoutSnapshot,
  describeWorkoutAdaptation,
  validateWorkoutAdaptation,
} from "../application";
import * as publicApi from "../index";
import { WorkoutAdaptationInputKinds } from "../models/WorkoutAdaptationInput";
import {
  createTestWorkoutAdaptationEngineService,
  createWorkoutAdaptationInput,
  FIXED_TIMESTAMP,
} from "../testSupport/fixtures";

describe("workout-adaptation regression", () => {
  it("keeps public root surface limited to models + application + service", () => {
    expect(typeof publicApi.adaptWorkout).toBe("function");
    expect(typeof publicApi.compareWorkout).toBe("function");
    expect(typeof publicApi.describeWorkoutAdaptation).toBe("function");
    expect(typeof publicApi.createWorkoutSnapshot).toBe("function");
    expect(typeof publicApi.validateWorkoutAdaptation).toBe("function");
    expect(publicApi.WorkoutAdaptationEngineService).toBeDefined();
    expect(typeof publicApi.createWorkoutAdaptationEngineService).toBe("function");
    expect(publicApi.WorkoutAdaptationInputKinds).toBeDefined();
    expect((publicApi as Record<string, unknown>).WorkoutAdaptationCoordinator).toBeUndefined();
    expect((publicApi as Record<string, unknown>).adaptExercise).toBeUndefined();
    expect((publicApi as Record<string, unknown>).evaluateVolume).toBeUndefined();
  });

  it("is deterministic for fixed clock + fixtures", () => {
    const service = createTestWorkoutAdaptationEngineService();
    const input = createWorkoutAdaptationInput({ kind: WorkoutAdaptationInputKinds.ADAPT });
    const a = adaptWorkout({ service, input });
    const b = adaptWorkout({
      service: createTestWorkoutAdaptationEngineService(),
      input,
    });
    expect(a.success).toBe(true);
    expect(b.success).toBe(true);
    expect(a.createdAt).toBe(FIXED_TIMESTAMP);
    expect(a.adaptation!.id).toBe(b.adaptation!.id);
    expect(a.adaptation!.decisionKeys).toEqual(b.adaptation!.decisionKeys);
    expect(a.updatedBlueprint!.id).toBe(b.updatedBlueprint!.id);
    expect(a.updatedBlueprint!.modificationIds).toEqual(b.updatedBlueprint!.modificationIds);
    expect(a.runtimeInput!.id).toBe(b.runtimeInput!.id);

    expect(compareWorkout({ service, input }).success).toBe(true);
    expect(createWorkoutSnapshot({ service, input }).success).toBe(true);
    expect(validateWorkoutAdaptation({ service, input }).success).toBe(true);
    expect(describeWorkoutAdaptation({ service }).version).toBe("24.1.0");
  });

  it("requires existing blueprint — no AI / no generation from scratch", () => {
    const service = createTestWorkoutAdaptationEngineService();
    const missing = adaptWorkout({
      service,
      input: createWorkoutAdaptationInput({ blueprintId: "" }),
    });
    expect(missing.success).toBe(false);

    const caps = describeWorkoutAdaptation({ service });
    expect(caps.boundaries).toEqual(
      expect.arrayContaining([
        "no_ai",
        "no_workout_generation_from_scratch",
        "adapts_existing_blueprint_only",
      ]),
    );
  });
});
