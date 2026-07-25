import {
  createGoalSnapshot,
  describeGoalProgress,
  trackGoalProgress,
  evaluateGoalProgress,
  validateGoalProgress,
} from "../application";
import * as publicApi from "../index";
import { GoalProgressInputKinds } from "../models/GoalProgressInput";
import {
  createGoalProgressInput,
  createTestGoalProgressEngineService,
  FIXED_TIMESTAMP,
} from "../testSupport/fixtures";

describe("goal-progress regression", () => {
  it("keeps public root surface limited to models + application + service", () => {
    expect(typeof publicApi.evaluateGoalProgress).toBe("function");
    expect(typeof publicApi.trackGoalProgress).toBe("function");
    expect(typeof publicApi.describeGoalProgress).toBe("function");
    expect(typeof publicApi.createGoalSnapshot).toBe("function");
    expect(typeof publicApi.validateGoalProgress).toBe("function");
    expect(publicApi.GoalProgressEngineService).toBeDefined();
    expect(typeof publicApi.createGoalProgressEngineService).toBe("function");
    expect(publicApi.GoalProgressInputKinds).toBeDefined();
    expect((publicApi as Record<string, unknown>).GoalProgressCoordinator).toBeUndefined();
    expect((publicApi as Record<string, unknown>).trackConsistency).toBeUndefined();
  });

  it("is deterministic for fixed clock + fixtures", () => {
    const service = createTestGoalProgressEngineService();
    const input = createGoalProgressInput({ kind: GoalProgressInputKinds.EVALUATE });
    const a = evaluateGoalProgress({ service, input });
    const b = evaluateGoalProgress({
      service: createTestGoalProgressEngineService(),
      input,
    });
    expect(a.success).toBe(true);
    expect(b.success).toBe(true);
    expect(a.createdAt).toBe(FIXED_TIMESTAMP);
    expect(a.decisions[0]!.id).toBe(b.decisions[0]!.id);
    expect(a.decisions[0]!.signalKeys).toEqual(b.decisions[0]!.signalKeys);
    expect(a.snapshot!.id).toBe(b.snapshot!.id);

    expect(trackGoalProgress({ service, input }).success).toBe(true);
    expect(createGoalSnapshot({ service, input }).success).toBe(true);
    expect(validateGoalProgress({ service, input }).success).toBe(true);
    expect(describeGoalProgress({ service }).version).toBe("24.4.0");
  });
});
