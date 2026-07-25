import { adaptWorkout, createWorkoutSnapshot } from "../application";
import { createMockAthleteStatePort } from "../contracts/AthleteStatePort";
import { createMockCoachContextPort } from "../contracts/CoachContextPort";
import { createMockContinuousAdaptationPort } from "../contracts/ContinuousAdaptationPort";
import { createMockWorkoutBlueprintPort } from "../contracts/WorkoutBlueprintPort";
import { createMockWorkoutRuntimePort } from "../contracts/WorkoutRuntimePort";
import { createWorkoutAdaptationEngineService } from "../services";
import {
  createFixedClock,
  createWorkoutAdaptationInput,
  FIXED_TIMESTAMP,
} from "../testSupport/fixtures";

describe("workout-adaptation integration", () => {
  it("resolves upstream ports and produces runtime handoff", () => {
    const service = createWorkoutAdaptationEngineService({
      workoutBlueprintPort: createMockWorkoutBlueprintPort(),
      workoutRuntimePort: createMockWorkoutRuntimePort(),
      athleteStatePort: createMockAthleteStatePort(),
      continuousAdaptationPort: createMockContinuousAdaptationPort(),
      coachContextPort: createMockCoachContextPort(),
      clock: createFixedClock(),
    });

    const input = createWorkoutAdaptationInput({
      blueprintKeys: Object.freeze([]),
      exerciseKeys: Object.freeze([]),
      sessionKeys: Object.freeze([]),
      weekKeys: Object.freeze([]),
      dayKeys: Object.freeze([]),
      decisionKeys: Object.freeze([]),
      signalKeys: Object.freeze([]),
    });

    const result = adaptWorkout({ service, input });
    expect(result.success).toBe(true);
    expect(result.createdAt).toBe(FIXED_TIMESTAMP);
    expect(result.updatedBlueprint?.blueprintId).toBe("blueprint:1");
    expect(result.updatedBlueprint!.exerciseKeys.length).toBeGreaterThan(0);
    expect(result.runtimeInput?.updatedBlueprintId).toBe(result.updatedBlueprint!.id);
    expect(result.adaptation!.decisionKeys.length).toBeGreaterThan(0);

    const snap = createWorkoutSnapshot({ service, input });
    expect(snap.success).toBe(true);
    expect(snap.snapshot?.modificationIds.length).toBeGreaterThan(0);
  });

  it("does not generate from empty blueprint without keys or port data", () => {
    const service = createWorkoutAdaptationEngineService({
      clock: createFixedClock(),
    });
    const result = adaptWorkout({
      service,
      input: createWorkoutAdaptationInput({
        blueprintKeys: Object.freeze([]),
        exerciseKeys: Object.freeze([]),
        sessionKeys: Object.freeze([]),
        weekKeys: Object.freeze([]),
        dayKeys: Object.freeze([]),
      }),
    });
    expect(result.success).toBe(false);
    expect(result.errors.some((e) => e.code === "empty_blueprint")).toBe(true);
  });
});
