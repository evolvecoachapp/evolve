import { adaptWorkout } from "../application";
import { applySafetyPolicy } from "../policies/SafetyPolicy";
import { applyWorkoutAdaptationPolicy } from "../policies/WorkoutAdaptationPolicy";
import {
  createTestWorkoutAdaptationEngineService,
  createWorkoutAdaptationInput,
} from "../testSupport/fixtures";

describe("workout-adaptation policies", () => {
  it("allows valid adapted packages", () => {
    const service = createTestWorkoutAdaptationEngineService();
    const result = adaptWorkout({
      service,
      input: createWorkoutAdaptationInput(),
    });
    expect(result.success).toBe(true);
    expect(applyWorkoutAdaptationPolicy(result.adaptation).length).toBe(0);
    expect(applySafetyPolicy(result.package!).length).toBe(0);
  });
});
