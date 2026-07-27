import { createCoachTimelineService } from "../../coach-timeline/services/CoachTimelineService";
import type { CoachTimelineService } from "../../coach-timeline/services/CoachTimelineService";
import { createExplainableCoachingSessionService } from "../../coaching-session/composition/services/ExplainableCoachingSessionService";
import type { CoachingSession } from "../../coaching-session/composition/models/CoachingSession";
import { CoachConversationIntents } from "../../coach-conversation/models/CoachConversationIntent";
import { GoalCategories } from "../../goal-progress/models/GoalCategory";
import type { GoalProgress } from "../../goal-progress/models/GoalProgress";
import { priorityForOrdinal } from "../../goal-progress/models/GoalPriority";
import { riskForSignalCount } from "../../goal-progress/models/GoalRisk";
import { EMPTY_GOAL_METADATA } from "../../goal-progress/models/GoalMetadata";
import type { NutritionPlan } from "../../nutrition-agent/models/NutritionPlan";
import { createPlanHistoryService } from "../../plan-history/services/PlanHistoryService";
import type { PlanHistoryService } from "../../plan-history/services/PlanHistoryService";
import type { PlanHistory } from "../../plan-history/models/PlanHistory";
import { createProactiveInsightsService } from "../../proactive-insights/services/ProactiveInsightsService";
import type { ProactiveInsightsService } from "../../proactive-insights/services/ProactiveInsightsService";
import type { CoachInsight } from "../../proactive-insights/models/CoachInsight";
import { CoachInsightSeverities } from "../../proactive-insights/models/CoachInsightSeverity";
import type { SleepProfile } from "../../recovery-agent/models/SleepProfile";
import type { RecoveryMetrics } from "../../recovery-intelligence/models/RecoveryMetrics";
import { createRecoveryMetricsFixture } from "../../recovery-intelligence/testSupport/fixtures";
import type { WorkoutPlan } from "../../workout-generation-pipeline/models/WorkoutPlan";
import type { WorkoutModificationResult } from "../../workout-generation-pipeline/models/WorkoutModificationResult";
import {
  createHomeExperienceService,
  type HomeExperienceService,
} from "../services/HomeExperienceService";

export const FIXED_HOME_TIMESTAMP = "2026-07-28T12:00:00.000Z";

export function createHomeClock(start = FIXED_HOME_TIMESTAMP): {
  readonly now: () => string;
  readonly advance: (ms: number) => void;
} {
  let current = Date.parse(start);
  return {
    now: () => new Date(current).toISOString(),
    advance: (ms: number) => {
      current += ms;
    },
  };
}

export function createTestHomeExperienceService(
  overrides: {
    readonly clock?: () => string;
    readonly coachTimeline?: CoachTimelineService;
    readonly planHistory?: PlanHistoryService;
    readonly proactiveInsights?: ProactiveInsightsService;
  } = {},
): HomeExperienceService {
  const clock = overrides.clock ?? (() => FIXED_HOME_TIMESTAMP);
  const coachTimeline =
    overrides.coachTimeline ?? createCoachTimelineService({ clock });
  const planHistory =
    overrides.planHistory ?? createPlanHistoryService({ clock });
  const proactiveInsights =
    overrides.proactiveInsights ??
    createProactiveInsightsService({ coachTimeline, planHistory, clock });
  const explainableCoachingSession = createExplainableCoachingSessionService({
    coachTimeline,
    planHistory,
    proactiveInsights,
    clock,
  });
  return createHomeExperienceService({
    coachTimeline,
    planHistory,
    proactiveInsights,
    explainableCoachingSession,
    clock,
  });
}

export function createStubWorkoutPlan(
  overrides: {
    readonly id?: string;
    readonly name?: string;
    readonly weekNumber?: number;
  } = {},
): WorkoutPlan {
  return {
    id: overrides.id ?? "workout-plan:1",
    name: overrides.name ?? "Strength Block",
    progression: Object.freeze({
      cue: null,
      deloadRecommended: false,
      weekNumber: overrides.weekNumber ?? 3,
      progressionPlanId: null,
      notes: Object.freeze([]),
    }),
  } as unknown as WorkoutPlan;
}

export function createStubModification(
  overrides: {
    readonly success?: boolean;
    readonly message?: string;
    readonly explanation?: string;
  } = {},
): WorkoutModificationResult {
  return {
    success: overrides.success ?? true,
    message: overrides.message ?? "Volume reduced for recovery.",
    explanation: overrides.explanation ?? "Fatigue elevated.",
  } as unknown as WorkoutModificationResult;
}

export function createStubPlanHistory(
  overrides: {
    readonly lineageId?: string;
    readonly planType?: "workout" | "nutrition";
    readonly currentVersionNumber?: number;
  } = {},
): PlanHistory {
  return {
    lineageId: overrides.lineageId ?? "lineage:1",
    planType: overrides.planType ?? "workout",
    athleteId: "athlete:1",
    currentVersionNumber: overrides.currentVersionNumber ?? 2,
    versions: Object.freeze([]),
    snapshots: Object.freeze([]),
    createdAt: FIXED_HOME_TIMESTAMP,
    updatedAt: FIXED_HOME_TIMESTAMP,
  } as unknown as PlanHistory;
}

export function createStubNutritionPlan(
  overrides: {
    readonly id?: string;
    readonly calories?: number;
    readonly phaseHint?: NutritionPlan["phaseHint"];
  } = {},
): NutritionPlan {
  return {
    id: overrides.id ?? "nutrition-plan:1",
    macroTargets: Object.freeze({
      calories: overrides.calories ?? 2400,
      proteinG: 180,
      carbsG: 250,
      fatG: 70,
      fiberG: 30,
    }),
    phaseHint: overrides.phaseHint ?? "maintain",
  } as unknown as NutritionPlan;
}

export function createStubRecoveryMetrics(): RecoveryMetrics {
  return createRecoveryMetricsFixture();
}

export function createStubSleepProfile(
  overrides: Partial<SleepProfile> = {},
): SleepProfile {
  return Object.freeze({
    hours: overrides.hours ?? 7.5,
    quality: overrides.quality ?? 0.8,
    label: overrides.label ?? "good",
    notes: overrides.notes ?? Object.freeze(["Restful night"]),
  });
}

export function createStubGoalProgress(
  overrides: {
    readonly id?: string;
    readonly category?: GoalProgress["category"];
  } = {},
): GoalProgress {
  return Object.freeze({
    id: overrides.id ?? "goal:1",
    athleteId: "athlete:1",
    sessionId: "session:1",
    conversationId: "conversation:1",
    contextId: "context:1",
    category: overrides.category ?? GoalCategories.PERFORMANCE,
    triggers: Object.freeze([]),
    conditions: Object.freeze([]),
    candidates: Object.freeze([
      Object.freeze({
        id: "checkpoint:1",
        category: GoalCategories.PERFORMANCE,
        subjectId: "goal:1",
        signalKeys: Object.freeze(["signal:1"]),
        severity: riskForSignalCount(1),
        metadata: EMPTY_GOAL_METADATA,
      }),
    ]),
    opportunities: Object.freeze([
      Object.freeze({
        id: "milestone:1",
        category: GoalCategories.PERFORMANCE,
        subjectId: "goal:1",
        candidateIds: Object.freeze(["checkpoint:1"]),
        signalKeys: Object.freeze(["signal:1"]),
        severity: riskForSignalCount(2),
        metadata: EMPTY_GOAL_METADATA,
      }),
    ]),
    reasons: Object.freeze([]),
    evaluation: Object.freeze({
      id: "eval:1",
      subjectId: "goal:1",
      priority: priorityForOrdinal(1),
      severity: riskForSignalCount(2),
      riskOrdinal: 2,
      consistencyOrdinal: 1,
      dependencyCount: 0,
      signalKeys: Object.freeze(["signal:1"]),
      metadata: EMPTY_GOAL_METADATA,
    }),
    priority: priorityForOrdinal(1),
    severity: riskForSignalCount(2),
    dependencies: Object.freeze([]),
    constraints: Object.freeze([]),
    signalKeys: Object.freeze(["signal:1"]),
    sourceKeys: Object.freeze(["source:1"]),
    metadata: EMPTY_GOAL_METADATA,
    createdAt: FIXED_HOME_TIMESTAMP,
  }) as unknown as GoalProgress;
}

export function createStubInsight(
  overrides: Partial<CoachInsight> & { readonly id: string },
): CoachInsight {
  return Object.freeze({
    id: overrides.id,
    athleteId: overrides.athleteId ?? "athlete:1",
    timestamp: overrides.timestamp ?? FIXED_HOME_TIMESTAMP,
    type: overrides.type ?? "TRAINING_VOLUME",
    severity: overrides.severity ?? CoachInsightSeverities.HIGH,
    evidence: overrides.evidence ??
      Object.freeze({
        keys: Object.freeze(["e1"]),
        timelineEntryIds: Object.freeze([]),
        signalCount: 1,
        sourceDomains: Object.freeze(["workout"]),
        summary: "Evidence",
      }),
    reason: overrides.reason ??
      Object.freeze({
        decisionId: null,
        recommendationId: null,
        explanationId: null,
        reason: "Pattern detected",
        impact: "Load rising",
        evidenceKeys: Object.freeze(["e1"]),
      }),
    recommendation: overrides.recommendation ??
      Object.freeze({
        action: "Reduce volume",
        rationale: "Fatigue rising",
        expectedOutcome: "Stabilize recovery",
        relatedRecommendationId: null,
      }),
    confidence: overrides.confidence ?? 0.8,
    relatedTimelineEntryIds:
      overrides.relatedTimelineEntryIds ?? Object.freeze([]),
    affectedDomain: overrides.affectedDomain ?? "workout",
    expectedOutcome: overrides.expectedOutcome ?? "Stabilize recovery",
    title: overrides.title ?? "Workout load rising",
    summary: overrides.summary ?? "Volume trend elevated",
    metadata: overrides.metadata ?? Object.freeze({}),
  }) as unknown as CoachInsight;
}

export function createStubCoachingSession(
  overrides: {
    readonly id?: string;
    readonly headline?: string;
    readonly expectedOutcome?: string;
  } = {},
): CoachingSession {
  return Object.freeze({
    id: overrides.id ?? "coach-session:1",
    timestamp: FIXED_HOME_TIMESTAMP,
    userRequest: "How am I doing?",
    conversationIntent: CoachConversationIntents.GENERAL_COACHING,
    evidenceUsed: Object.freeze({
      items: Object.freeze([]),
      sources: Object.freeze([]),
      timelineEntryIds: Object.freeze([]),
      planVersionNumbers: Object.freeze([]),
      decisionIds: Object.freeze([]),
      recommendationIds: Object.freeze([]),
      explanationIds: Object.freeze([]),
      insightIds: Object.freeze([]),
      keys: Object.freeze([]),
      summary: "none",
    }),
    timelineReferences: Object.freeze([]),
    decisionSummary: Object.freeze({
      decisionIds: Object.freeze([]),
      titles: Object.freeze([]),
      summary: "No decisions",
      present: false,
    }),
    recommendationSummary: Object.freeze({
      recommendationIds: Object.freeze(["rec:1"]),
      titles: Object.freeze(["Hold intensity"]),
      summary: "Hold intensity this week",
      present: true,
    }),
    insightSummary: Object.freeze({
      insightIds: Object.freeze([]),
      titles: Object.freeze([]),
      severities: Object.freeze([]),
      summary: "No insights",
      present: false,
    }),
    reasoningSummary: Object.freeze({
      explanationIds: Object.freeze([]),
      reasoningPoints: Object.freeze([]),
      summary: "No explanation",
      present: false,
    }),
    expectedOutcome: overrides.expectedOutcome ?? "Maintain progress safely",
    confidence: Object.freeze({
      level: "medium",
      score: 0.5,
      evidenceCount: 0,
      sourceCount: 0,
      rationale: "Limited evidence",
    }),
    relatedDomains: Object.freeze(["workout"]),
    context: Object.freeze({
      id: "ctx:1",
      athleteId: "athlete:1",
      conversationId: "conversation:1",
      sessionId: "session:1",
      userRequest: "How am I doing?",
      conversationIntent: CoachConversationIntents.GENERAL_COACHING,
      lifecycleSessionId: "session:1",
      workoutPlanId: null,
      planLineageId: null,
      relatedDomains: Object.freeze(["workout"]),
      createdAt: FIXED_HOME_TIMESTAMP,
    }),
    summary: Object.freeze({
      id: "summary:1",
      headline: overrides.headline ?? "Steady coaching guidance",
      narrative: "Hold intensity and monitor recovery.",
      highlights: Object.freeze(["Hold intensity"]),
      generatedAt: FIXED_HOME_TIMESTAMP,
    }),
    metadata: Object.freeze({}),
  }) as unknown as CoachingSession;
}
