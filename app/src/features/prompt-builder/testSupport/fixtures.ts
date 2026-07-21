import type { CoachInsight } from "../../coach-intelligence/models/CoachInsight";
import type { CoachRecommendation } from "../../coach-intelligence/models/CoachRecommendation";
import type { CoachSummary } from "../../coach-intelligence/models/CoachSummary";
import type { RiskFlag } from "../../coach-intelligence/models/RiskFlag";
import type { CoachIntelligenceSnapshot } from "../../coach-intelligence/repository";

export function createCoachSummary(
  overrides: Partial<CoachSummary> = {},
): CoachSummary {
  return Object.freeze({
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
      plateauExerciseCount: 1,
    }),
    consistencyScore: 0.82,
    insightCount: 2,
    riskCount: 1,
    recommendationCount: 1,
    generatedAt: "2026-07-21T12:00:00.000Z",
    ...overrides,
  });
}

export function createInsights(): readonly CoachInsight[] {
  return Object.freeze([
    Object.freeze({
      id: "insight:recent_pr",
      kind: "recent_pr" as const,
      confidence: 0.9,
      detectedAt: "2026-07-21T12:00:00.000Z",
      payload: Object.freeze({ ageDays: 3 }),
    }),
    Object.freeze({
      id: "insight:exercise_plateau",
      kind: "exercise_plateau" as const,
      confidence: 0.7,
      detectedAt: "2026-07-21T12:00:00.000Z",
      payload: Object.freeze({ exerciseId: "squat", weeksStagnant: 4 }),
    }),
  ]);
}

export function createRiskFlags(): readonly RiskFlag[] {
  return Object.freeze([
    Object.freeze({
      code: "exercise_stagnation" as const,
      severity: "low" as const,
      evidence: Object.freeze({ plateauExerciseCount: 1 }),
    }),
  ]);
}

export function createRecommendations(): readonly CoachRecommendation[] {
  return Object.freeze([
    Object.freeze({
      code: "vary_exercises" as const,
      priority: "medium" as const,
      relatedInsightIds: Object.freeze(["insight:exercise_plateau"]),
    }),
  ]);
}

export function createSnapshot(
  overrides: Partial<CoachIntelligenceSnapshot> = {},
): CoachIntelligenceSnapshot {
  const insights = overrides.insights ?? createInsights();
  const riskFlags = overrides.riskFlags ?? createRiskFlags();
  const recommendations =
    overrides.recommendations ?? createRecommendations();
  const summary =
    overrides.summary ??
    createCoachSummary({
      insightCount: insights.length,
      riskCount: riskFlags.length,
      recommendationCount: recommendations.length,
    });

  return Object.freeze({
    summary,
    insights,
    riskFlags,
    recommendations,
  });
}
