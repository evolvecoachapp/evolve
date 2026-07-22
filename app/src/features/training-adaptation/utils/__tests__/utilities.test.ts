import {
  createTestAdaptationContext,
  createTrainingAdaptationRequest,
} from "../../testSupport/fixtures";
import {
  aggregateAssessments,
  buildAdaptationContext,
  calculateAdaptationScore,
  calculateReadinessScore,
  compareRecommendations,
  estimateAdaptationScore,
  freezeTrainingAdaptationResult,
  mergeScoreParts,
  normalizeRecommendations,
  sortRecommendations,
} from "../index";
import { FIXED_ADAPTATION_TIMESTAMP } from "../../engine/TrainingAdaptationEngine";
import { createEmptyAdaptationScore } from "../../models/AdaptationScore";
import { TrainingAdaptationEngine } from "../../engine/TrainingAdaptationEngine";

describe("training adaptation utilities", () => {
  it("builds adaptation context from a request", async () => {
    const context = await createTestAdaptationContext();
    expect(context.dayId).toBe("day-upper");
    expect(context.progressionRequestId).toContain("progression:");
    expect(context.prescriptionCount).toBe(3);
    expect(context.weekCount).toBe(4);
  });

  it("calculates and merges adaptation scores", () => {
    const score = calculateAdaptationScore({
      readiness: 2,
      recovery: 4,
      fatigue: 3,
    });
    expect(score.total).toBe(9);

    const merged = mergeScoreParts(
      { readiness: 1 },
      { recovery: 2 },
      { fatigue: 1.5 },
    );
    expect(merged.total).toBe(4.5);
  });

  it("aggregates assessments into readiness", () => {
    const readiness = aggregateAssessments({
      recovery: Object.freeze({
        status: "adequate" as const,
        score: 80,
        reasons: Object.freeze([]),
      }),
      fatigue: Object.freeze({
        level: "moderate" as const,
        score: 40,
        reasons: Object.freeze([]),
      }),
      constraints: Object.freeze({
        hardCount: 0,
        softCount: 1,
        blockingCodes: Object.freeze([]),
        score: 90,
        reasons: Object.freeze([]),
      }),
      executionConfidence: 85,
    });

    expect(readiness.overallScore).toBe(
      calculateReadinessScore({
        recoveryScore: 80,
        fatigueScore: 40,
        constraintScore: 90,
        executionConfidence: 85,
      }),
    );
    expect(Object.isFrozen(readiness)).toBe(true);
  });

  it("sorts and normalizes recommendations deterministically", () => {
    const recommendations = normalizeRecommendations([
      Object.freeze({
        id: "b",
        strategyId: "intensity_adaptation",
        action: Object.freeze({
          kind: "reduce_intensity" as const,
          magnitude: 1,
          priority: 30,
        }),
        reasons: Object.freeze([]),
        score: createEmptyAdaptationScore(),
      }),
      Object.freeze({
        id: "a",
        strategyId: "volume_adaptation",
        action: Object.freeze({
          kind: "reduce_volume" as const,
          magnitude: 1,
          priority: 20,
        }),
        reasons: Object.freeze([]),
        score: createEmptyAdaptationScore(),
      }),
    ]);

    const sorted = sortRecommendations(recommendations);
    expect(sorted.map((entry) => entry.id)).toEqual(["a", "b"]);
    expect(compareRecommendations(sorted[0]!, sorted[1]!)).toBeLessThan(0);
  });

  it("freezes adaptation results and estimates score", async () => {
    const engine = new TrainingAdaptationEngine();
    const result = await engine.evaluate(await createTrainingAdaptationRequest());
    const frozen = freezeTrainingAdaptationResult(result);
    expect(Object.isFrozen(frozen)).toBe(true);
    expect(frozen.adaptedAt).toBe(FIXED_ADAPTATION_TIMESTAMP);

    const scoreA = estimateAdaptationScore(
      result.readiness,
      result.recommendations,
    );
    const scoreB = estimateAdaptationScore(
      result.readiness,
      result.recommendations,
    );
    expect(scoreA).toEqual(scoreB);
  });

  it("buildAdaptationContext matches fixture helper", async () => {
    const request = await createTrainingAdaptationRequest();
    expect(buildAdaptationContext(request).blueprintId).toBe(
      request.blueprint.id,
    );
  });
});
