import { createMockAthleteStatePort } from "../contracts/AthleteStatePort";
import { createMockContextFusionPort } from "../contracts/ContextFusionPort";
import { createMockDecisionEnginePort } from "../contracts/DecisionEnginePort";
import { createMockExplainabilityEnginePort } from "../contracts/ExplainabilityEnginePort";
import { createMockRecommendationEnginePort } from "../contracts/RecommendationEnginePort";
import {
  createAdaptationInput,
  createFixedClock,
  createTestContinuousAdaptationEngineService,
} from "../testSupport/fixtures";
import { createContinuousAdaptationEngineService } from "../services/ContinuousAdaptationEngineService";

describe("continuous-adaptation integration", () => {
  it("mocks upstream engines via ports and freezes outputs", () => {
    const service = createContinuousAdaptationEngineService({
      decisionEnginePort: createMockDecisionEnginePort(),
      recommendationEnginePort: createMockRecommendationEnginePort(),
      explainabilityEnginePort: createMockExplainabilityEnginePort(),
      contextFusionPort: createMockContextFusionPort(["recovery", "nutrition"]),
      athleteStatePort: createMockAthleteStatePort(true),
      clock: createFixedClock(),
    });

    const input = createAdaptationInput({
      decisions: Object.freeze([]),
      recommendations: Object.freeze([]),
      explanations: Object.freeze([]),
      stateKeys: Object.freeze([]),
    });
    const result = service.evaluateAdaptation(input);

    expect(result.success).toBe(true);
    expect(result.package).not.toBeNull();
    expect(Object.isFrozen(result)).toBe(true);
    expect(Object.isFrozen(result.package)).toBe(true);
    expect(Object.isFrozen(result.decisions[0])).toBe(true);
    expect(result.workoutAdaptationInput).not.toBeNull();
    expect(result.nutritionAdaptationInput).not.toBeNull();
    expect(result.recoveryAdaptationInput).not.toBeNull();
    expect(result.goalProgressInput).not.toBeNull();
  });

  it("does not mutate plans — handoffs are inputs only", () => {
    const service = createTestContinuousAdaptationEngineService();
    const result = service.evaluateAdaptation(createAdaptationInput());
    expect(result.success).toBe(true);

    for (const handoff of [
      result.workoutAdaptationInput,
      result.nutritionAdaptationInput,
      result.recoveryAdaptationInput,
      result.goalProgressInput,
    ]) {
      expect(handoff).not.toBeNull();
      expect(handoff!.id.startsWith("handoff:")).toBe(true);
      expect(Object.isFrozen(handoff)).toBe(true);
      expect(handoff).not.toHaveProperty("plan");
      expect(handoff).not.toHaveProperty("modifiedPlan");
      expect(handoff).not.toHaveProperty("mutations");
    }
  });
});
