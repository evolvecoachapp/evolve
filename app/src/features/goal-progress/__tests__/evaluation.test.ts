import { evaluateGoalSignals } from "../evaluation/StrengthGoalEvaluator";
import { evaluateConsistencyOrdinal } from "../evaluation/ConsistencyEvaluator";
import { evaluatePerformanceGoalCount } from "../evaluation/PerformanceGoalEvaluator";
import { evaluatePriority, evaluatePriorityForCategory } from "../evaluation/WeightGoalEvaluator";
import { evaluateRecoveryGoalOrdinal } from "../evaluation/RecoveryGoalEvaluator";
import { evaluateSeverity } from "../evaluation/BodyCompositionEvaluator";
import { GoalAchievementKinds } from "../models/GoalAchievement";
import { EMPTY_GOAL_METADATA } from "../models/GoalMetadata";

describe("goal-progress evaluation", () => {
  it("uses deterministic ordinal/table lookups only", () => {
    expect(evaluatePriority(0).label).toBe("critical");
    expect(evaluatePriority(3).label).toBe("low");
    expect(evaluatePriorityForCategory("recovery").ordinal).toBe(0);
    expect(evaluateSeverity(0).level).toBe("none");
    expect(evaluateSeverity(4).level).toBe("critical");
    expect(evaluatePerformanceGoalCount(["a", "a", "b"])).toBe(2);
    expect(evaluateConsistencyOrdinal(2, 2)).toBe(0);
    expect(evaluateRecoveryGoalOrdinal(1, 4)).toBe(3);

    const evalResult = evaluateGoalSignals({
      subjectId: "athlete:1",
      triggers: Object.freeze([
        Object.freeze({
          id: "t1",
          kind: GoalAchievementKinds.RECOVERY,
          signalKey: "recovery:status",
          subjectId: "athlete:1",
          present: true,
          metadata: EMPTY_GOAL_METADATA,
        }),
      ]),
      candidates: Object.freeze([]),
      opportunities: Object.freeze([]),
      dependencyFromIds: Object.freeze(["d1"]),
    });
    expect(Object.isFrozen(evalResult)).toBe(true);
    expect(evalResult.signalKeys).toContain("recovery:status");
  });
});
