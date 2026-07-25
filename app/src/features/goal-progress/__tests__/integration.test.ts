import { createMockAthleteStatePort } from "../contracts/AthleteStatePort";
import { createMockDecisionEnginePort } from "../contracts/DecisionEnginePort";
import { createMockNutritionAdaptationPort } from "../contracts/NutritionAdaptationPort";
import { createMockRecommendationEnginePort } from "../contracts/RecommendationEnginePort";
import { createMockRecoveryAdaptationPort } from "../contracts/RecoveryAdaptationPort";
import { createMockWorkoutAdaptationPort } from "../contracts/WorkoutAdaptationPort";
import { createGoalProgressEngineService } from "../services/GoalProgressEngineService";
import {
  createFixedClock,
  createGoalProgressInput,
  createTestGoalProgressEngineService,
} from "../testSupport/fixtures";

describe("goal-progress integration", () => {
  it("mocks upstream engines via ports and freezes outputs", () => {
    const service = createGoalProgressEngineService({
      decisionEnginePort: createMockDecisionEnginePort(),
      recommendationEnginePort: createMockRecommendationEnginePort(),
      nutritionAdaptationPort: createMockNutritionAdaptationPort(),
      workoutAdaptationPort: createMockWorkoutAdaptationPort(["recovery", "nutrition"]),
      recoveryAdaptationPort: createMockRecoveryAdaptationPort(),
      athleteStatePort: createMockAthleteStatePort(true),
      clock: createFixedClock(),
    });

    const input = createGoalProgressInput({
      decisions: Object.freeze([]),
      recommendations: Object.freeze([]),
      explanations: Object.freeze([]),
      stateKeys: Object.freeze([]),
    });
    const result = service.evaluateGoalProgress(input);

    expect(result.success).toBe(true);
    expect(result.package).not.toBeNull();
    expect(Object.isFrozen(result)).toBe(true);
    expect(Object.isFrozen(result.package)).toBe(true);
    expect(Object.isFrozen(result.decisions[0])).toBe(true);
    expect(result.continuousAdaptationInput).not.toBeNull();
  });

  it("does not mutate plans — handoffs are inputs only", () => {
    const service = createTestGoalProgressEngineService();
    const result = service.evaluateGoalProgress(createGoalProgressInput());
    expect(result.success).toBe(true);

    const handoff = result.continuousAdaptationInput;
    expect(handoff).not.toBeNull();
    expect(handoff!.id.startsWith("handoff:")).toBe(true);
    expect(Object.isFrozen(handoff)).toBe(true);
    expect(handoff).not.toHaveProperty("plan");
    expect(handoff).not.toHaveProperty("modifiedPlan");
    expect(handoff).not.toHaveProperty("mutations");
  });
});
