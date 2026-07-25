import { evaluateAdherence } from "../evaluation/AdherenceEvaluator";
import { evaluateConsistencySignal } from "../evaluation/ConsistencySignalEvaluator";
import { evaluateStrengthPlateau } from "../evaluation/StrengthPlateauEvaluator";
import { evaluateMilestone } from "../evaluation/MilestoneEvaluator";
import { evaluateRecoverySignal } from "../evaluation/RecoverySignalEvaluator";
import { evaluateBodyCompositionRegression } from "../evaluation/BodyCompositionRegressionEvaluator";
import { evaluatePerformanceTrend } from "../evaluation/PerformanceTrendEvaluator";
import { createGoalProgressInput } from "../testSupport/fixtures";

describe("goal-progress detection", () => {
  it("detects signal key/flag presence only", () => {
    const input = createGoalProgressInput();
    const plateau = evaluateStrengthPlateau(input);
    expect(plateau.triggers.length).toBeGreaterThan(0);
    expect(plateau.triggers.every((t) => t.present)).toBe(true);
    expect(Object.isFrozen(plateau.triggers[0])).toBe(true);

    expect(evaluateMilestone(input).candidates.length).toBeGreaterThan(0);
    expect(evaluateRecoverySignal(input).opportunities.length).toBeGreaterThan(0);
    expect(evaluatePerformanceTrend(input).triggers.some((t) => t.signalKey.includes("trend"))).toBe(true);

    const empty = createGoalProgressInput({
      performanceKeys: Object.freeze([]),
      recoveryKeys: Object.freeze([]),
      nutritionKeys: Object.freeze([]),
      goalKeys: Object.freeze([]),
      adherenceKeys: Object.freeze([]),
      historyKeys: Object.freeze([]),
      timelineKeys: Object.freeze([]),
      stateKeys: Object.freeze([]),
      signalFlags: Object.freeze({}),
    });
    expect(evaluateBodyCompositionRegression(empty).triggers.length).toBe(0);
    expect(evaluateConsistencySignal(empty).candidates.length).toBe(0);
    expect(evaluateAdherence(empty).opportunities.length).toBe(0);
  });
});
