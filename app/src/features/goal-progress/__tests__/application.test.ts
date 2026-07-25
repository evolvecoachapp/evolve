import {
  createGoalSnapshot,
  describeGoalProgress,
  trackGoalProgress,
  evaluateGoalProgress,
  validateGoalProgress,
} from "../application";
import { GoalProgressInputKinds } from "../models/GoalProgressInput";
import { GoalOperationKinds } from "../models/GoalResult";
import {
  createGoalProgressInput,
  createTestGoalProgressEngineService,
} from "../testSupport/fixtures";

describe("goal-progress application", () => {
  it("exposes public API evaluate → detect → snapshot → validate → describe", () => {
    const service = createTestGoalProgressEngineService();

    const evaluated = evaluateGoalProgress({
      service,
      input: createGoalProgressInput({ kind: GoalProgressInputKinds.EVALUATE }),
    });
    expect(evaluated.success).toBe(true);
    expect(evaluated.operation).toBe(GoalOperationKinds.EVALUATE);
    expect(evaluated.decisions.length).toBeGreaterThan(0);
    expect(Object.isFrozen(evaluated.decisions[0])).toBe(true);

    const detected = trackGoalProgress({
      service,
      input: createGoalProgressInput({ id: "request:detect", kind: GoalProgressInputKinds.TRACK }),
    });
    expect(detected.success).toBe(true);
    expect(detected.operation).toBe(GoalOperationKinds.TRACK);

    const snap = createGoalSnapshot({
      service,
      input: createGoalProgressInput({ id: "request:snapshot", kind: GoalProgressInputKinds.SNAPSHOT }),
    });
    expect(snap.success).toBe(true);
    expect(snap.snapshot).not.toBeNull();

    const validated = validateGoalProgress({
      service,
      input: createGoalProgressInput({ id: "request:validate", kind: GoalProgressInputKinds.VALIDATE }),
    });
    expect(validated.success).toBe(true);

    const caps = describeGoalProgress({ service });
    expect(caps.name).toBe("Goal Progress Engine");
    expect(caps.capabilities).toEqual(
      expect.arrayContaining([
        "evaluateGoalProgress",
        "trackGoalProgress",
        "describeGoalProgress",
        "createGoalSnapshot",
        "validateGoalProgress",
      ]),
    );
  });
});
