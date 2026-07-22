import { FIXED_ADAPTATION_TIMESTAMP } from "../../engine/TrainingAdaptationEngine";
import type { TrainingAdaptationResult } from "../../models/TrainingAdaptationResult";
import { createEmptyAdaptationScore } from "../../models/AdaptationScore";
import { createTestAdaptationContext } from "../../testSupport/fixtures";
import { createSampleProgressionPlan } from "../../testSupport/fixtures";
import { freezeTrainingAdaptationResult } from "../../utils/freezeTrainingAdaptationResult";
import { InMemoryTrainingAdaptationRepository } from "../InMemoryTrainingAdaptationRepository";

async function sampleResult(
  requestId: string,
): Promise<TrainingAdaptationResult> {
  const plan = await createSampleProgressionPlan();
  return freezeTrainingAdaptationResult({
    requestId,
    context: await createTestAdaptationContext(),
    readiness: Object.freeze({
      recovery: Object.freeze({
        status: "adequate" as const,
        score: 80,
        reasons: Object.freeze([]),
      }),
      fatigue: Object.freeze({
        level: "low" as const,
        score: 20,
        reasons: Object.freeze([]),
      }),
      constraints: Object.freeze({
        hardCount: 0,
        softCount: 0,
        blockingCodes: Object.freeze([]),
        score: 100,
        reasons: Object.freeze([]),
      }),
      executionConfidence: 90,
      overallScore: 85,
      reasons: Object.freeze([]),
    }),
    recommendations: Object.freeze([]),
    adaptedProgression: Object.freeze({
      sourcePlanRequestId: plan.requestId,
      readinessScore: 85,
      appliedRecommendationIds: Object.freeze([]),
      notes: Object.freeze(["maintain_progression"]),
      sourcePlan: plan,
    }),
    explanations: Object.freeze([]),
    validationIssues: Object.freeze([]),
    score: createEmptyAdaptationScore(),
    adaptedAt: FIXED_ADAPTATION_TIMESTAMP,
  });
}

describe("InMemoryTrainingAdaptationRepository", () => {
  it("saves, loads, lists, and deletes cached results", async () => {
    const repo = new InMemoryTrainingAdaptationRepository();
    const saved = await repo.save(await sampleResult("adaptation:a"));
    expect(saved.requestId).toBe("adaptation:a");
    expect(Object.isFrozen(saved)).toBe(true);

    const loaded = await repo.load("adaptation:a");
    expect(loaded?.requestId).toBe("adaptation:a");

    await repo.save(await sampleResult("adaptation:b"));
    const listed = await repo.list();
    expect(listed.map((entry) => entry.requestId)).toEqual([
      "adaptation:a",
      "adaptation:b",
    ]);

    expect(await repo.delete("adaptation:a")).toBe(true);
    expect(await repo.load("adaptation:a")).toBeNull();

    await repo.clear();
    expect(await repo.list()).toEqual([]);
  });
});
