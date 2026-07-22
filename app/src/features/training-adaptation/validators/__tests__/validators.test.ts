import {
  createTrainingAdaptationRequest,
} from "../../testSupport/fixtures";
import { TrainingAdaptationEngine } from "../../engine/TrainingAdaptationEngine";
import { createEmptyAdaptationScore } from "../../models/AdaptationScore";
import {
  validateAdaptationOrdering,
  validateAssessmentConsistency,
  validateRecommendationConsistency,
  validateTrainingAdaptationResult,
} from "../index";

describe("training adaptation validators", () => {
  it("accepts a well-formed adaptation result", async () => {
    const engine = new TrainingAdaptationEngine();
    const request = await createTrainingAdaptationRequest();
    const result = await engine.evaluate(request);

    expect(
      validateTrainingAdaptationResult(
        request,
        result.readiness,
        result.recommendations,
        result.context.constraints,
      ),
    ).toEqual([]);
  });

  it("detects readiness score out of range", async () => {
    const engine = new TrainingAdaptationEngine();
    const result = await engine.evaluate(
      await createTrainingAdaptationRequest(),
    );
    const broken = Object.freeze({
      ...result.readiness,
      overallScore: 150,
    });
    expect(validateAssessmentConsistency(broken)).toEqual(
      expect.arrayContaining(["readiness_score_out_of_range"]),
    );
  });

  it("detects duplicate recommendation ids", () => {
    const recommendation = Object.freeze({
      id: "dup",
      strategyId: "volume_adaptation",
      action: Object.freeze({
        kind: "reduce_volume" as const,
        magnitude: 1,
        priority: 1,
      }),
      reasons: Object.freeze([]),
      score: createEmptyAdaptationScore(),
    });
    expect(
      validateRecommendationConsistency([recommendation, recommendation]),
    ).toEqual(expect.arrayContaining(["recommendation_duplicate_id:dup"]));
  });

  it("detects adaptation ordering violations", () => {
    const low = Object.freeze({
      id: "a",
      strategyId: "volume_adaptation",
      action: Object.freeze({
        kind: "reduce_volume" as const,
        magnitude: 1,
        priority: 10,
      }),
      reasons: Object.freeze([]),
      score: createEmptyAdaptationScore(),
    });
    const high = Object.freeze({
      id: "b",
      strategyId: "intensity_adaptation",
      action: Object.freeze({
        kind: "reduce_intensity" as const,
        magnitude: 1,
        priority: 1,
      }),
      reasons: Object.freeze([]),
      score: createEmptyAdaptationScore(),
    });
    expect(validateAdaptationOrdering([low, high])).toEqual(
      expect.arrayContaining([
        expect.stringMatching(/^adaptation_order_violation:/),
      ]),
    );
  });
});
