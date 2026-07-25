import { adaptWorkout } from "../application";
import { validateWorkoutPackage } from "../validators";
import {
  createTestWorkoutAdaptationEngineService,
  createWorkoutAdaptationInput,
} from "../testSupport/fixtures";

describe("workout-adaptation validators", () => {
  it("validates successful adapt package", () => {
    const service = createTestWorkoutAdaptationEngineService();
    const result = adaptWorkout({
      service,
      input: createWorkoutAdaptationInput(),
    });
    expect(result.package).not.toBeNull();
    const validation = validateWorkoutPackage(result.package!);
    expect(validation.valid).toBe(true);
    expect(Object.isFrozen(validation)).toBe(true);
  });
});
