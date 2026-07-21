import { act, renderHook, waitFor } from "@testing-library/react-native";
import type { CoachInsight } from "../../models/CoachInsight";
import type { CoachRecommendation } from "../../models/CoachRecommendation";
import type { CoachSummary } from "../../models/CoachSummary";
import type { RiskFlag } from "../../models/RiskFlag";
import type {
  CoachIntelligenceRepository,
  CoachIntelligenceSnapshot,
} from "../../repository";
import { useCoachInsights } from "../useCoachInsights";

function createSnapshot(): CoachIntelligenceSnapshot {
  const summary: CoachSummary = Object.freeze({
    volumeTrend: Object.freeze({
      metric: "volume" as const,
      direction: "increasing" as const,
      changeRatio: 0.2,
      windowWeeks: 8,
    }),
    frequencyTrend: Object.freeze({
      metric: "frequency" as const,
      direction: "stable" as const,
      changeRatio: 0.02,
      windowWeeks: 8,
    }),
    recovery: Object.freeze({
      level: "moderate" as const,
      daysSinceLastSession: 2,
      fatigueScore: 0.4,
    }),
    progress: Object.freeze({
      level: "improving" as const,
      recentPRCount: 1,
      plateauExerciseCount: 0,
    }),
    consistencyScore: 0.82,
    insightCount: 1,
    riskCount: 0,
    recommendationCount: 1,
    athleteGoal: null,
    trainingExperience: null,
    generatedAt: "2026-07-21T12:00:00.000Z",
  });

  const insights: readonly CoachInsight[] = Object.freeze([
    Object.freeze({
      id: "insight:recent_pr",
      kind: "recent_pr" as const,
      confidence: 0.9,
      detectedAt: "2026-07-21T12:00:00.000Z",
      payload: Object.freeze({ ageDays: 3 }),
    }),
  ]);

  const riskFlags: readonly RiskFlag[] = Object.freeze([]);
  const recommendations: readonly CoachRecommendation[] = Object.freeze([
    Object.freeze({
      code: "progress_load" as const,
      priority: "medium" as const,
      relatedInsightIds: Object.freeze(["insight:recent_pr"]),
    }),
  ]);

  return Object.freeze({
    summary,
    insights,
    riskFlags,
    recommendations,
  });
}

function createRepository(
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

describe("useCoachInsights", () => {
  it("loads structured insights through the injected repository", async () => {
    const repository = createRepository();
    const { result } = renderHook(() => useCoachInsights({ repository }));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBeNull();
    expect(result.current.summary?.consistencyScore).toBe(0.82);
    expect(result.current.insights).toHaveLength(1);
    expect(result.current.riskFlags).toEqual([]);
    expect(result.current.recommendations[0]?.code).toBe("progress_load");
    expect(repository.getSnapshot).toHaveBeenCalled();
  });

  it("surfaces repository failures", async () => {
    const repository = createRepository();
    (repository.getSnapshot as jest.Mock).mockRejectedValue(
      new Error("coach intelligence failed"),
    );

    const { result } = renderHook(() => useCoachInsights({ repository }));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.summary).toBeNull();
    expect(result.current.error).toBe("coach intelligence failed");
  });

  it("ignores late results after unmount", async () => {
    let resolveSnapshot: (value: CoachIntelligenceSnapshot) => void = () =>
      undefined;
    const repository = createRepository();
    (repository.getSnapshot as jest.Mock).mockImplementation(
      () =>
        new Promise<CoachIntelligenceSnapshot>((resolve) => {
          resolveSnapshot = resolve;
        }),
    );

    const { result, unmount } = renderHook(() =>
      useCoachInsights({ repository }),
    );
    unmount();

    await act(async () => {
      resolveSnapshot(createSnapshot());
    });

    expect(result.current.loading).toBe(true);
    expect(result.current.summary).toBeNull();
  });
});
