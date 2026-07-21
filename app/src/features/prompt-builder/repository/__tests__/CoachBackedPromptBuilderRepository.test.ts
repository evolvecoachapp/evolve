import type {
  CoachIntelligenceRepository,
  CoachIntelligenceSnapshot,
} from "../../../coach-intelligence/repository";
import { createSnapshot } from "../../testSupport/fixtures";
import { CoachBackedPromptBuilderRepository } from "../CoachBackedPromptBuilderRepository";
import { validatePromptContext } from "../../utils/validatePromptContext";

function createCoachRepository(
  snapshot: CoachIntelligenceSnapshot = createSnapshot(),
): CoachIntelligenceRepository {
  return {
    getSnapshot: jest.fn(async () => snapshot),
    getCoachSummary: jest.fn(async () => snapshot.summary),
    getInsights: jest.fn(async () => snapshot.insights),
    getRiskFlags: jest.fn(async () => snapshot.riskFlags),
    getRecommendations: jest.fn(async () => snapshot.recommendations),
  };
}

describe("CoachBackedPromptBuilderRepository", () => {
  const referenceDate = new Date("2026-07-21T15:00:00.000Z");

  it("builds PromptContext from coach intelligence only", async () => {
    const coachIntelligence = createCoachRepository();
    const repository = new CoachBackedPromptBuilderRepository(
      coachIntelligence,
    );

    const context = await repository.getPromptContext(referenceDate);

    expect(coachIntelligence.getSnapshot).toHaveBeenCalledWith(referenceDate);
    expect(context.athlete.consistencyScore).toBe(0.82);
    expect(context.training.volumeTrend.metric).toBe("volume");
    expect(context.training.frequencyTrend.metric).toBe("frequency");
    expect(context.performance.personalRecordInsights[0]?.kind).toBe(
      "recent_pr",
    );
    expect(context.coach.riskFlags).toHaveLength(1);
    expect(context.coach.recommendations[0]?.code).toBe("vary_exercises");
    expect(context.metadata.generatedAt).toBe(referenceDate.toISOString());
    expect(context.metadata.sourceGeneratedAt).toBe(
      "2026-07-21T12:00:00.000Z",
    );
    expect(context.sections.map((section) => section.id)).toEqual([
      "athlete",
      "training_summary",
      "volume_trend",
      "frequency_trend",
      "personal_records",
      "risk_flags",
      "recommendations",
      "metadata",
    ]);
    expect(validatePromptContext(context)).toEqual([]);
  });

  it("never returns prompt strings or markdown fields", async () => {
    const repository = new CoachBackedPromptBuilderRepository(
      createCoachRepository(),
    );

    const context = await repository.getPromptContext(referenceDate);
    const serialized = JSON.stringify(context);

    expect(serialized).not.toMatch(/#{1,6}\s/);
    expect(context).not.toHaveProperty("prompt");
    expect(context).not.toHaveProperty("markdown");
    expect(context).not.toHaveProperty("messages");
  });

  it("propagates coach intelligence failures", async () => {
    const coachIntelligence = createCoachRepository();
    (coachIntelligence.getSnapshot as jest.Mock).mockRejectedValue(
      new Error("coach intelligence failed"),
    );
    const repository = new CoachBackedPromptBuilderRepository(
      coachIntelligence,
    );

    await expect(repository.getPromptContext(referenceDate)).rejects.toThrow(
      "coach intelligence failed",
    );
  });
});
