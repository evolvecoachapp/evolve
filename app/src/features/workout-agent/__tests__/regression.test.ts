import { processWorkoutRequest, buildWorkoutPlan } from "../application";
import {
  createTestAgentService,
  createWorkoutRequestFixture,
} from "../testSupport/fixtures";

describe("workout-agent regression", () => {
  it("identical requests produce deterministic proposals", () => {
    const service = createTestAgentService();
    const request = createWorkoutRequestFixture();
    const a = buildWorkoutPlan({ service, request });
    const b = buildWorkoutPlan({ service, request });
    expect(a.split).toBe(b.split);
    expect(a.primaryLifts).toEqual(b.primaryLifts);
    expect(a.volumeScore).toBe(b.volumeScore);
    expect(a.intensityScore).toBe(b.intensityScore);
  });

  it("result remains frozen after process", () => {
    const service = createTestAgentService();
    const result = processWorkoutRequest({
      service,
      request: createWorkoutRequestFixture(),
    });
    expect(Object.isFrozen(result)).toBe(true);
    expect(Object.isFrozen(result.decision)).toBe(true);
    expect(Object.isFrozen(result.context)).toBe(true);
    const before = result.success;
    try {
      // @ts-expect-error intentional mutation attempt
      result.success = !before;
    } catch {
      // strict mode may throw; non-strict silently ignores
    }
    expect(result.success).toBe(before);
  });
});
