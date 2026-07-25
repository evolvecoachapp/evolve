import { evaluateAdaptationSignals } from "../evaluation/AdaptationEvaluator";
import { evaluateConsistencyOrdinal } from "../evaluation/ConsistencyEvaluator";
import { evaluateDependencyCount } from "../evaluation/DependencyEvaluator";
import { evaluatePriority, evaluatePriorityForCategory } from "../evaluation/PriorityEvaluator";
import { evaluateRiskOrdinal } from "../evaluation/RiskEvaluator";
import { evaluateSeverity } from "../evaluation/SeverityEvaluator";
import { AdaptationTriggerKinds } from "../models/AdaptationTrigger";
import { EMPTY_ADAPTATION_METADATA } from "../models/AdaptationMetadata";

describe("continuous-adaptation evaluation", () => {
  it("uses deterministic ordinal/table lookups only", () => {
    expect(evaluatePriority(0).label).toBe("critical");
    expect(evaluatePriority(3).label).toBe("low");
    expect(evaluatePriorityForCategory("recovery").ordinal).toBe(0);
    expect(evaluateSeverity(0).level).toBe("none");
    expect(evaluateSeverity(4).level).toBe("critical");
    expect(evaluateDependencyCount(["a", "a", "b"])).toBe(2);
    expect(evaluateConsistencyOrdinal(2, 2)).toBe(0);
    expect(evaluateRiskOrdinal(1, 4)).toBe(3);

    const evalResult = evaluateAdaptationSignals({
      subjectId: "athlete:1",
      triggers: Object.freeze([
        Object.freeze({
          id: "t1",
          kind: AdaptationTriggerKinds.RECOVERY,
          signalKey: "recovery:status",
          subjectId: "athlete:1",
          present: true,
          metadata: EMPTY_ADAPTATION_METADATA,
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
